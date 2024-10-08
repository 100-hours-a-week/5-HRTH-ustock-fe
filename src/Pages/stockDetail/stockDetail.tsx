import Calculator from "../../Component/Calculator/calculator";
import Chart from "../../Component/Chart/chart";
import { useEffect, useState } from "react";

import {
  StockDataProps,
  ChartProps,
  CandleData,
} from "../../constants/interface";

import * as S from "./stockDetailStyle";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatRate, formatPrice } from "../../util/util";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

type ViewList = "일" | "주" | "월";

// viewList를 정수랑 매핑ㄹ
const viewListToInt: Record<ViewList, number> = {
  일: 1,
  주: 2,
  월: 3,
};

// viewList값을 정수로 변환
const convertViewListToInt = (view: ViewList): number => {
  return viewListToInt[view];
};

const StockDetail: React.FC = () => {
  const location = useLocation();
  const stockCode = location.pathname.split("/")[2];
  const nav = useNavigate();
  const [selectedView, setSelectedView] = useState<ViewList>("일");
  const [chartData, setChartData] = useState<any[]>([]);
  const selectedViewInt = convertViewListToInt(selectedView);

  // 클릭한 기준 css 변경 && INT로 변환
  const handleClick = (view: ViewList) => {
    setSelectedView(view);
    const viewInt = convertViewListToInt(view);
  };

  // 주식 상세 정보 불러오기 API 연결
  const [stockData, setStockData] = useState<StockDataProps | null>(null);
  useEffect(() => {
    if (stockCode)
      axios
        .get(`${process.env.REACT_APP_API_URL}/v1/stocks/${stockCode}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200) {
            const result = res.data;
            setStockData(result);
          } else if (res.status === 400) {
            nav("/login");
          }
        })
        .catch((err) => nav("/error"));
  }, []);

  // 쿼리스트링으로 보낼 때, 시작/종료 날짜 보내야하는지 확인
  // 상태저장해서 Chart 컴포넌트 Props로 넘겨줘야하는지 확인
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/v1/stocks/${stockCode}/chart?period=${selectedViewInt}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.status === 200) {
          const formattedData = res.data.map((chart: ChartProps) => ({
            x: chart.date,
            y: [
              chart.candle.open,
              chart.candle.high,
              chart.candle.low,
              chart.candle.close,
            ],
            z: chart.news.map((newItem) => {
              return {
                title: newItem.title,
                url: newItem.url,
              };
            }),
          }));
          setChartData(formattedData);
        }
      })
      .catch((error) => {
        nav("/error");
      });
  }, [setSelectedView, stockCode, selectedView]);

  return (
    <S.Container>
      {stockData ? (
        <>
          <S.InfoContainer>
            <div>
              <S.StockName>{stockData.name}</S.StockName>
              <S.CodeContainer>
                <S.StockCode>{stockData.code}</S.StockCode>
              </S.CodeContainer>
            </div>
            <S.PriceContainer>
              <S.StockPrice>
                {formatPrice(stockData.price)}
                <span style={{ fontSize: "12px" }}>원</span>
              </S.StockPrice>
              <S.ChangeContainer>
                <S.StockChange>
                  {stockData.changeRate < 0 ? (
                    <GoTriangleDown />
                  ) : (
                    <GoTriangleUp />
                  )}
                  {formatPrice(Math.abs(stockData.change))}원
                </S.StockChange>
                <S.StockChange>
                  ({formatRate(Math.abs(stockData.changeRate))}%)
                </S.StockChange>
              </S.ChangeContainer>
            </S.PriceContainer>
          </S.InfoContainer>
          <S.ViewSelectContainer>
            {["일", "주", "월"].map((view) => (
              <S.ViewSelectBox
                key={view}
                isSelected={selectedView === view}
                onClick={() => handleClick(view as ViewList)}
              >
                {view}
              </S.ViewSelectBox>
            ))}
          </S.ViewSelectContainer>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {chartData.length > 0 ? (
              <Chart data={chartData} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Calculator />
          </div>
        </>
      ) : (
        <p>Loading...</p> //
      )}
    </S.Container>
  );
};

export default StockDetail;
