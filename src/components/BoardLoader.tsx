import { MyNode } from "@/utils/types";
import { Board } from "../utils/game";

const BoardLoader: React.FC = (props) => {
  const dragDrop = (e) => {
    console.log("hp", boardInstance.getMate());
    e.stopPropagation();

    if (boardInstance.getMate()) {
      return;
    }

    let isCorrectPieceMoved = draggedElement.firstChild?.classList.contains(
      boardInstance.getTurn()
    );
    //let taken = e.target.classList.contains("piece");
    let isCorrectPieceTaken = e.target.firstChild?.classList.contains(
      boardInstance.getTurn() === "white" ? "black" : "white"
    );
    let isAlliedTargeted = e.target.firstChild?.classList.contains(
      boardInstance.getTurn() === "white" ? "white" : "black"
    );

    targetId =
      Number(e.target.getAttribute("square-id")) ||
      Number(e.target.parentNode.getAttribute("square-id"));
    console.log(targetId, startPositionId, draggedElement.id);

    let valid = boardInstance.checkValidation(
      draggedElement,
      startPositionId,
      targetId
    );

    if (isCorrectPieceMoved) {
      if (isAlliedTargeted) {
        return;
      }
      if (valid) {
        if (draggedElement.id === "king" || draggedElement.id === "rook") {
          draggedElement.setAttribute("moved", "true");
        }
        if (
          draggedElement.id === "king" &&
          Math.abs(startPositionId - targetId) === 2
        ) {
          if (targetId > startPositionId) {
            boardInstance
              .getBoard()
              [targetId - 1].appendChild(
                boardInstance.getBoard()[targetId + 2].firstChild as Node
              );
          } else {
            boardInstance
              .getBoard()
              [targetId + 1].appendChild(
                boardInstance.getBoard()[targetId - 1].firstChild as MyNode
              );
          }
        }
        if (isCorrectPieceTaken) {
          e.target.parentNode.append(draggedElement);
          boardInstance
            .getPieces()
            .splice(boardInstance.getPieces().indexOf(e.target), 1);
          e.target.remove();
          if (boardInstance.checkIsKingExposed()) {
            boardInstance
              .getBoard()
              [startPositionId].appendChild(draggedElement);
            boardInstance.getBoard()[targetId].appendChild(e.target);
            return;
          }

          boardInstance.changeTurn(draggedElement, targetId);
          return;
        }
        e.target.appendChild(draggedElement);
        if (!boardInstance.checkIsKingExposed()) {
          boardInstance.changeTurn(draggedElement, targetId);
          return;
        } else {
          boardInstance.getBoard()[startPositionId].appendChild(draggedElement);
          if (e.target.hasChildNodes()) {
            boardInstance.getBoard()[targetId].appendChild(e.target);
          }
        }
      }

      // if (taken) {
      //   //display info to player
      //   return;
      //}
    }
  };

  const dragStart = (e) => {
    startPositionId = Number(e.target.parentNode.getAttribute("square-id"));
    draggedElement = e.target;
  };

  const dragOver = (e) => {
    e.preventDefault();
  };

  const infoDisplay = document.getElementById("info-display");
  const gameBoard = document.getElementById("board");
  const playerDisplay = document.getElementById("player");
  let startPositionId, draggedElement, targetId;
  const boardInstance = new Board();
  boardInstance.setBoard();
  addListeners();

  function addListeners(squares = boardInstance.getBoard()) {
    return squares.forEach((square: MyNode) => {
      square.addEventListener("dragstart", dragStart);
      square.addEventListener("dragover", dragOver);
      square.addEventListener("drop", dragDrop);
    });
  }

  function resetGame() {
    const squares = boardInstance.getBoard();
    squares.forEach((s) => s.remove());
    boardInstance.setBoard();
    addListeners();
  }

  const resetbtn = document.getElementById("reset");

  resetbtn?.addEventListener("click", resetGame);

  return <div>BoardLoader</div>;
};

export default BoardLoader;
