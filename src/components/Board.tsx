import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

const BoardLoader = dynamic(
  () => {
    return import("./BoardLoader");
  },
  { ssr: false }
);

const Board: React.FC = () => {
  return (
    <>
      <BoardLoader />
      <div id="board"></div>

      <p>
        It is <span id="player"></span> go
      </p>
      <p id="info-display"></p>
      <button id="reset">play again</button>
    </>
  );
};

export default Board;
