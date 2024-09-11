import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";
import { ChartStyle } from "./chartStyle"; // Assuming you have the styles defined in this file
import { formatPrice } from "../../util/util";
import ModalOpen from "../Modal/modal";

// import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

interface CandleData {
  data: {
    x: string;
    y: [number, number, number, number];
    z: { title: string; url: string }[];
  }[];
}

const Chart = ({ data }: CandleData) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newsHtml, setNewsHtml] = useState<string>("");
  const latestDate = new Date(data[data.length - 1].x).getTime();
  const initialZoomMin = new Date(
    latestDate - 90 * 24 * 60 * 60 * 1000
  ).getTime();

  const onRequestClose = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const options = {
        series: [
          {
            name: "Price",
            data: data,
          },
        ],
        chart: {
          type: "candlestick",
          height: 350,
          toolbar: {
            show: true,
          },
          events: {
            // Apply click event only to candlestick data points
            dataPointSelection: function (
              event: any,
              chartContext: any,
              opts: any
            ) {
              // Update state to show modal when a candlestick is clicked
              setIsOpen(true);
            },
          },
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: "#FF5759", // Green color for rising candles
              downward: "#28a745", // Red color for falling candles
            },
          },
        },
        xaxis: {
          type: "datetime",
          labels: {
            datetimeFormatter: {
              year: "yyyy년",
              month: "M월",
              day: "dd일",
              hour: "HH:mm",
            },
          },
          min: initialZoomMin,
          max: latestDate,
        },
        tooltip: {
          x: {
            formatter: function (val: any) {
              return "";
            },
          },
          y: {
            formatter: function (val: any) {
              return `${val}`;
            },
          },
          custom: function ({ seriesIndex, dataPointIndex, w }: any) {
            const close = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
            const low = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
            const open = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
            const high = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
            const news = w.globals.seriesZ[seriesIndex][dataPointIndex];
            var newsHtml = "";

            if (Array.isArray(news)) {
              news.forEach((newItem) => {
                newsHtml += `<li style="padding-top:1rem; padding-bottom:0.5rem; padding-left:0.5rem; list-style:none; border-bottom:1px solid rgba(209, 209, 214, 0.3);" onmouseover="this.style.backgroundColor='#E6E5FF';"
                onmouseout="this.style.backgroundColor='';"><a href=${newItem.url} target="_blank" rel="noopener noreferrer nofollow" 
                style="text-decoration:none; color: black; font-size:15px; font-family:SCDream2;  transition: background-color 0.3s ease;">
                
                ${newItem.title}</a></li>`;
              });
            }

            setNewsHtml(newsHtml);

            const xLabel = new Date(
              w.globals.seriesX[seriesIndex][dataPointIndex]
            ).toLocaleDateString("ko-KR");

            const color = close > open ? "#FF5759" : "#615EFC";

            return `
            <div style="margin-top : 1rem; text-align: center; margin-bottom: 1rem; font-size: 12px; color: #ADA9BB">
                ${
                  Array.isArray(news) && news.length > 0
                    ? "<p>👀 캔들을 클릭해서 </p><p>그날의 뉴스를 확인해보세요!</p>"
                    : "<p>해당 날짜에 뉴스가 없습니다.</p>"
                }</div>
            </div>
            <div style="padding: 5px; font-size: 12px; width: 200px; height: 130px;text-align : center">
            <p style="font-family: 'SCDream7';">${xLabel}</p>
            <hr style="margin-bottom : 0.5rem;margin-top : 0.2rem;"/>
            <div style="display: flex; flex-direction: column; gap: 5px;">
            <p>시가: <span style="padding-left : 1rem; color : ${color}">${formatPrice(
              open
            )}</span></p>
            <p>고가: <span style="padding-left : 1rem; color : ${color}">${formatPrice(
              high
            )}</span></p>
            <p>저가: <span style="padding-left : 1rem; color : ${color}">${formatPrice(
              low
            )}</span></p>
            <p>종가: <span style="padding-left : 1rem; color : ${color}">${formatPrice(
              close
            )}</span></p>`;
          },
        },
      };

      const chart = new ApexCharts(chartRef.current, options);
      chart.render();

      return () => {
        chart.destroy();
      };
    }
  }, [data]);

  const handleConfirm = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChartStyle id="chart" ref={chartRef}></ChartStyle>
      {isOpen && (
        <ModalOpen
          isOpen={isOpen}
          showConfirmButton="확인"
          showCancelButton={false}
          onConfirm={handleConfirm}
          onRequestClose={onRequestClose}
          confirmLabel="확인"
        >
          <p
            style={{
              fontSize: "20px",
              fontWeight: "600",
            }}
          >
            뉴스-껄
            <span
              style={{
                paddingLeft: "1rem",
                fontSize: "15px",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: newsHtml }}>
                {/* <HiOutlineArrowTopRightOnSquare /> */}
              </div>
            </span>
          </p>
        </ModalOpen>
      )}
    </>
  );
};

export default Chart;
