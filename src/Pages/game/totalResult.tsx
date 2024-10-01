import styled from "styled-components";
import GameHeader from "../../Component/Game/GameHeader";
import Button from "../../Component/Button/button";
import SkrrImg from "../../img/SkerrImg.png";
import SaySkrr from "../../Component/Game/Rank/saySkrr";
import axios from "axios";
import { useEffect, useState } from "react";
import { RankDataProps } from "../../constants/interface";
import RankList from "../../Component/Game/Rank/rankList";
import { useNavigate, useLocation } from "react-router-dom";
import swal from "sweetalert";
import { useGameStore } from "../../store/useGameStore";
import { debounce } from "lodash";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const SkrrContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  margin-top: 1.5rem;
`;

const ImgStyle = styled.img`
  margin-left: 200px;
`;

const TextStyle = styled.div`
  margin-top: 3rem;
  margin-bottom: 1rem;
`;

const BtnBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  margin-right: 2.5rem;
  margin-top: 1rem;
`;

const NickBox = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid;
  border-radius: 5px;
  width: 260px;
  height: 36px;
  padding: 10px;
  color: #858494;
`;

const TotalResult = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState("");
  const [rankList, setRankList] = useState<RankDataProps[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [userMoney, setUserMoney] = useState<number>(0);

  const { checkGameDone, setCheckGameDone } = useGameStore((state) => ({
    checkGameDone: state.checkGameDone,
    setCheckGameDone: state.setCheckGameDone,
  }));

  const [btnDisabled, setBtnDisabled] = useState(false);

  // 랭킹 리스트 요청 api
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/v1/game/result`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const list = res.data;
          setRankList(list);

          // 사용자 순위 저장
          const userIndex = list.findIndex(
            (item: any) => item.playerType === "USER"
          );
          setUserRank(userIndex + 1);

          // 사용자 최종 수익금 저장
          const userBudget = list[userIndex].total;
          setUserMoney(userBudget);

          // 사용자 닉네임 저장
          setUser(list[userIndex].nickname);
        }
      });
  }, []);

  // 게임 결과 저장
  const handleRankClick = debounce(() => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/v1/game/result/save`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          {
            console.log("랭킹등록!!");
            swal({
              title: "랭킹 등록 완료!",
              text: "랭킹이 등록되었습니다.",
              icon: "success",
            });
            setBtnDisabled(true);
          }
        } else {
          {
            swal({
              title: "등록에 실패하셨습니다.",
              text: "다시 시도해주세요!",
              icon: "error",
            });
          }
        }
      });
  }, 1000);

  // const handleRankBtn = () => {
  //   axios
  //     .post(
  //       `${process.env.REACT_APP_API_URL}/v1/game/result/save`,
  //       {},
  //       {
  //         withCredentials: true,
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       if (res.status === 200) {
  //         {
  //           console.log("랭킹등록!!");
  //           swal({
  //             title: "랭킹 등록 완료!",
  //             text: "랭킹이 등록되었습니다.",
  //             icon: "success",
  //           });
  //         }
  //       } else {
  //         {
  //           swal({
  //             title: "등록에 실패하셨습니다.",
  //             text: "다시 시도해주세요!",
  //             icon: "error",
  //           });
  //         }
  //       }
  //     });
  // };

  // 랭킹 저장 여부 확인
  useEffect(() => {
    if (location.state?.btnDisabled) {
      console.log("다시 잘 넘어와?", location.state.btnDisabled);
      setBtnDisabled(location.state.btnDisabled);
    }
  }, [location.state]);

  return (
    <>
      {checkGameDone ? (
        <Container>
          <GameHeader text={"최 종  결 과"} />
          <SkrrContainer>
            <SaySkrr rank={userRank} money={userMoney} />
            <ImgStyle src={SkrrImg} alt="껄무새 이미지" />
          </SkrrContainer>
          <BtnBox>
            <NickBox>{user}</NickBox>
            <Button
              children="랭킹에 등록하기"
              $state="normal"
              $colorType="gradient"
              $size="small"
              disabled={btnDisabled}
              onClick={() => {
                // handleRankBtn();
                handleRankClick();
              }}
            />
          </BtnBox>

          <RankList data={rankList} />

          <TextStyle>내가 거래한 주식의 정체는?</TextStyle>
          <Button
            children="🔎 주식 정체 확인하러 가기"
            $state="normal"
            $colorType="gradient"
            $size="gradientBtn"
            onClick={() => {
              nav("/game/gameStocks", { state: { btnDisabled: btnDisabled } });
            }}
          />
        </Container>
      ) : (
        <p>게임을 끝내지 않으셨네요! </p>
      )}
    </>
  );
};

export default TotalResult;
