import * as CONSTANTS from "./constants.js";

function Board() {
  this.pieces = [];
  this.mate = null;
  this.board = [];
  this.turn = "white";

  this.setBoard = () => {
    this.pieces = [];
    this.board.map((s) => gameBoard.removeChild(s));
    this.board = CONSTANTS.START_PIECES.map((piece, index) => {
      const square = document.createElement("div");
      square.classList.add("square");
      square.setAttribute("square-id", index);
      square.innerHTML = piece;
      square.firstChild && square.firstChild.setAttribute("draggable", true);
      const row = Math.floor((63 - index) / 8) + 1;
      if (row % 2 === 0) {
        square.classList.add(index % 2 === 0 ? "beige" : "brown");
      } else {
        square.classList.add(index % 2 === 0 ? "brown" : "beige");
      }
      if (index <= 15) {
        square.firstChild.firstChild.classList.add("black");
        this.pieces.push(square.firstChild);
      }
      if (index >= 48) {
        square.firstChild.firstChild.classList.add("white");
        this.pieces.push(square.firstChild);
      }

      gameBoard.appendChild(square);
      return square;
    });
    this.board.forEach((square) => {
      square.addEventListener("dragstart", dragStart);
      square.addEventListener("dragover", dragOver);
      square.addEventListener("drop", dragDrop);
    });
    this.turn = "white";
    this.mate = null;
    infoDisplay.textContent = "";
  };

  this.checkValidation = function (targetId) {
    const startId = Number(startPositionId),
      type = draggedElement.id;

    return getPieceMoves(type, startId).includes(targetId);
  };

  this.checkIfKingsthretend = () => {
    let isMate = false;
    const threated = this.pieces.flatMap((piece) => {
      return getPieceThreats(
        piece.id,
        Number(piece.parentNode.getAttribute("square-id"))
      );
    });
    const threatendKing = threated.filter(
      (m) => Game.board[m].firstChild.id === "king"
    );

    if (threatendKing.length > 0) {
      const enemies = this.pieces.filter(
        (p) =>
          !p.firstChild.classList.contains(
            Game.board[threatendKing[0]].firstChild.firstChild.classList[0]
          )
      );

      const enemyMoves = enemies.flatMap((piece) =>
        getPieceMoves(
          piece.id,
          Number(piece.parentNode.getAttribute("square-id"))
        )
      );

      const possibleMoves = getPieceMoves("king", threatendKing[0]).filter(
        (x) => !enemyMoves.includes(x)
      );

      const attackers = enemies.filter((enemy) =>
        getPieceThreats(
          enemy.id,
          Number(enemy.parentNode.getAttribute("square-id"))
        ).includes(threatendKing[0])
      );

      //defect with threatedAxis
      console.log(attackers, threatendKing);
      const threatedAxis = getKingAttackerAxis(
        attackers[0].id,
        Number(attackers[0].parentNode.getAttribute("square-id")),
        threatendKing[0]
      );

      threatedAxis.push(
        Number(attackers[0].parentNode.getAttribute("square-id"))
      );
      const blockers = [];

      const alliedMoves = this.pieces
        .filter((p) =>
          p.firstChild.classList.contains(
            Game.board[threatendKing[0]].firstChild.firstChild.classList[0]
          )
        )
        .filter((p) => p.id !== "king")
        .flatMap((piece) => {
          const moves = getPieceMoves(
            piece.id,
            Number(piece.parentNode.getAttribute("square-id"))
          );
          threatedAxis.map((m) => {
            if (moves.includes(m)) {
              blockers.push(piece);
            }
          });
        });

      console.log(blockers, possibleMoves);

      if (possibleMoves.length === 0 && blockers.length === 0) {
        isMate = true;
        this.mate =
          Game.board[threatendKing].firstChild.firstChild.classList[0];
        infoDisplay.textContent = `${Game.board[threatendKing].firstChild.firstChild.classList[0]} mated.`;
        return;
      }

      infoDisplay.textContent = `${Game.board[threatendKing].firstChild.firstChild.classList[0]} checked`;
    }
    if (!isMate) {
      if (this.turn === "white") {
        this.turn = "black";
      } else {
        this.turn = "white";
      }
    }
  };

  this.changeTurn = () => {
    if (draggedElement.id === "pawn") {
      //pawn promotion
      if (Math.floor(targetId / 8) === 0 || Math.floor(targetId / 8) === 7) {
        const pieceIndex = Game.pieces.indexOf(Game.board[targetId].firstChild);
        Game.pieces.splice(pieceIndex, 1);
        Game.board[targetId].firstChild.remove();
        Game.board[targetId].innerHTML =
          CONSTANTS.promotionPieces[
            Number(
              prompt("Enter a Number:1-queen   2-knight   3-bishop   4-rook")
            ) - 1
          ];
        Game.board[targetId].firstChild.setAttribute("draggable", true);
        Game.board[targetId].firstChild.firstChild.classList.add(Game.turn);
        Game.pieces.splice(pieceIndex, 0, Game.board[targetId].firstChild);
      }
    }
    infoDisplay.textContent = "";

    this.checkIfKingsthretend();

    playerDisplay.textContent = this.turn;
  };

  this.setBoard();

  playerDisplay.textContent = this.turn;
}

function pieceGotSupport(position) {
  const color = Game.board[position].firstChild.firstChild.classList[0];

  const team = Game.pieces.filter((p) =>
    p.firstChild.classList.contains(color)
  );

  const teamMoves = team.flatMap((p) =>
    getPieceMoves(p.id, Number(p.parentNode.getAttribute("square-id")))
  );

  return teamMoves.includes(position);
}

function getPieceThreats(type, start) {
  const moves = getPieceMoves(type, start) || [];
  return moves.filter((move) => {
    if (
      Game.board[move] &&
      Game.board[move].hasChildNodes() &&
      !Game.board[move].firstChild.firstChild.classList.contains(
        Game.board[start].firstChild.firstChild.classList[0]
      )
    ) {
      return move;
    }
  });
}

function getKingAttackerAxis(type, start, kingPos) {
  const axis = [];
  let temp = start;

  switch (type) {
    case "rook":
      temp = start;
      if (start % 8 === kingPos % 8) {
        //Y axis
        if (start > kingPos) {
          while (temp - 8 !== kingPos) {
            temp -= 8;
            axis.push(temp);
          }
        } else {
          while (temp + 8 !== kingPos) {
            temp += 8;
            axis.push(temp);
          }
        }
      }
      if (Math.floor(start / 8) === Math.floor(kingPos / 8)) {
        //X axis
        if (start > kingPos) {
          while (temp - 1 !== kingPos) {
            temp -= 1;
            axis.push(temp);
          }
        } else {
          while (temp + 1 !== kingPos) {
            temp += 1;
            axis.push(temp);
          }
        }
      }

      return axis;
    case "bishop":
      temp = start;
      if (start % 7 === kingPos % 7) {
        if (start > kingPos) {
          while (temp - 7 !== kingPos) {
            temp -= 7;
            axis.push(temp);
          }
        } else {
          while (temp + 7 !== kingPos) {
            temp += 7;
            axis.push(temp);
          }
        }
      }
      if (start % 9 === kingPos % 9) {
        if (start > kingPos) {
          while (temp - 9 !== kingPos) {
            temp -= 9;
            axis.push(temp);
          }
        } else {
          while (temp + 9 !== kingPos) {
            temp += 9;
            axis.push(temp);
          }
        }
      }
      return axis;
    case "queen":
      return getKingAttackerAxis("bishop", start, kingPos).concat(
        getKingAttackerAxis("rook", start, kingPos)
      );
    default:
      return axis;
  }
}

function getPieceMoves(type, start) {
  let i = 1;
  const moves = [],
    blocked = {};

  switch (type) {
    case "knight":
      return CONSTANTS.knightMoves
        .map((m) => m + start)
        .filter(
          (m) =>
            Math.abs((start % 8) - (m % 8)) < 3 &&
            Math.floor(start / 8) !== Math.floor(m / 8) &&
            Game.board[m] &&
            (!Game.board[m].hasChildNodes() ||
              !Game.board[m].firstChild.firstChild.classList.contains(
                Game.board[start].firstChild.firstChild.classList[0]
              ))
        );
    case "king":
      let availableCastle = [];
      if (!Game.board[start].firstChild.hasAttribute("moved")) {
        if (
          Game.board[start - 3].firstChild &&
          !Game.board[start - 2].hasChildNodes() &&
          !Game.board[start - 1].hasChildNodes() &&
          Game.board[start - 3].firstChild.id === "rook" &&
          !Game.board[start - 3].firstChild.hasAttribute("moved")
        ) {
          availableCastle.push(start - 2);
        }
        if (
          Game.board[start + 4].firstChild &&
          !Game.board[start + 3].hasChildNodes() &&
          !Game.board[start + 2].hasChildNodes() &&
          !Game.board[start + 1].hasChildNodes() &&
          Game.board[start + 4].firstChild.id === "rook" &&
          !Game.board[start + 4].firstChild.hasAttribute("moved")
        ) {
          availableCastle.push(start + 2);
        }
      }

      return CONSTANTS.kingMoves
        .map((m) => m + start)
        .filter(
          (i) =>
            Game.board[i] &&
            (!Game.board[i].hasChildNodes() ||
              (Game.board[i].hasChildNodes() &&
                !Game.board[i].firstChild.firstChild.classList.contains(
                  Game.board[start].firstChild.firstChild.classList[0]
                ) &&
                !pieceGotSupport(i)))
        )
        .concat(availableCastle);
    case "pawn":
      if (
        Math.floor(start / 8) === 1 &&
        !Game.board[start + 8].hasChildNodes() &&
        !Game.board[start + 16].hasChildNodes()
      ) {
        moves.push(start + 16);
      } else if (
        Math.floor(start / 8) === 6 &&
        !Game.board[start - 8].hasChildNodes() &&
        !Game.board[start - 16].hasChildNodes()
      ) {
        moves.push(start - 16);
      }
      if (Game.board[start].firstChild.firstChild.classList.contains("white")) {
        if (!Game.board[start - 8].hasChildNodes()) {
          moves.push(start - 8);
        }
        if (
          Game.board[start - 7].hasChildNodes() &&
          Math.floor((start - 7) / 8) !== Math.floor(start / 8)
        ) {
          moves.push(start - 7);
        }
        if (
          Game.board[start - 9].hasChildNodes() &&
          Math.floor((start - 9) / 8) === Math.floor(start / 8) - 1
        ) {
          moves.push(start - 9);
        }
      } else {
        if (!Game.board[start + 8].hasChildNodes()) {
          moves.push(start + 8);
        }
        if (
          Game.board[start + 7].hasChildNodes() &&
          Math.floor((start + 7) / 8) !== Math.floor(start / 8)
        ) {
          moves.push(start + 7);
        }
        if (
          Game.board[start + 9].hasChildNodes() &&
          Math.floor((start + 9) / 8) === Math.floor(start / 8) + 1
        ) {
          moves.push(start + 9);
        }
      }

      return moves;
    case "bishop":
      blocked.diagLeftTop = false;
      blocked.diagRightTop = false;
      blocked.diagLeftBottom = false;
      blocked.diagRightBottom = false;

      while (i <= 8) {
        //top-left
        if (!blocked.diagLeftTop) {
          iterateAxis(moves, blocked, 8 * i + start + i, "diagLeftTop", start);
        }

        //top-right
        if (!blocked.diagRightTop) {
          iterateAxis(moves, blocked, 8 * i + start - i, "diagRightTop", start);
        }

        //bottom-left
        if (!blocked.diagLeftBottom) {
          iterateAxis(
            moves,
            blocked,
            start - 8 * i - i,
            "diagLeftBottom",
            start
          );
        }

        //bottom-right
        if (!blocked.diagRightBottom) {
          iterateAxis(
            moves,
            blocked,
            start - 8 * i + i,
            "diagRightBottom",
            start
          );
        }

        i++;
      }
      // console.log(
      //   "TotalMoves,diag:",
      //   moves.map((m) => Game.board[m])
      // );
      return moves;
    case "rook":
      blocked.leftRoad = false;
      blocked.topRoad = false;
      blocked.bottomRoad = false;
      blocked.rightRoad = false;
      i = 1;
      while (i <= 8) {
        // iterate and cheking for possible moves

        //left

        if (!blocked.leftRoad) {
          iterateAxis(moves, blocked, start - i, "leftRoad", start);
        }
        //right

        if (!blocked.rightRoad) {
          iterateAxis(moves, blocked, start + i, "rightRoad", start);
        }
        //bottom

        if (!blocked.bottomRoad) {
          iterateAxis(moves, blocked, start - 8 * i, "bottomRoad", start);
        }

        //top
        if (!blocked.topRoad) {
          iterateAxis(moves, blocked, start + 8 * i, "topRoad", start);
        }

        i++;
      }

      // console.log(
      //   "TotalMovesXY:",
      //   moves.map((m) => Game.board[m])
      // );

      return moves;
    case "queen":
      const temp = getPieceMoves("bishop", start);
      getPieceMoves("rook", start).map((m) => temp.push(m));
      return temp;
  }
}

Number.prototype.isBetween = function (min, max) {
  return this >= min && this <= max;
};

function iterateAxis(moves, blocked, index, axis, start) {
  if (Game.board[index] === undefined) {
    return (blocked[axis] = true);
  } else if (axis === "leftRoad" || axis === "rightRoad") {
    if (Math.floor(index / 8) !== Math.floor(start / 8)) {
      blocked[axis] = true;
      return;
    }
  }
  if (axis.includes("diag")) {
    if (
      (index + 1) % 8 === 0 ||
      index.isBetween(0, 7) ||
      index.isBetween(56, 63) ||
      index % 8 === 0
    ) {
      blocked[axis] = true;
    }
  }

  if (!Game.board[index].hasChildNodes()) {
    //free square
    moves.push(index);
    return;
  } else if (Game.board[index].hasChildNodes()) {
    //full square
    const isTargetEnemy = !Game.board[
      index
    ].firstChild.firstChild.classList.contains(
      Game.board[start].firstChild.firstChild.classList[0]
    );
    if (isTargetEnemy) {
      moves.push(index);
      blocked[axis] = true;
    } else {
      moves.push(index);

      blocked[axis] = true;
    }
  }
}

let startPositionId, draggedElement, targetId;

function checkIsKingExposed() {
  const enemyteam = Game.pieces.filter(
    (piece) => !piece.firstChild.classList.contains(Game.turn)
  );
  const threats = enemyteam.flatMap((piece) =>
    getPieceThreats(
      piece.id,
      Number(piece.parentNode.getAttribute("square-id"))
    )
  );
  const king = threats.filter((t) => Game.board[t].firstChild.id === "king");
  if (king.length > 0) {
    return true;
  } else {
    return false;
  }
}

function dragDrop(e) {
  e.stopPropagation();
  if (Game.mate) {
    return;
  }

  console.log(draggedElement);

  let isCorrectPieceMoved = draggedElement.firstChild.classList.contains(
    Game.turn
  );
  //let taken = e.target.classList.contains("piece");
  let isCorrectPieceTaken = e.target.firstChild?.classList.contains(
    Game.turn === "white" ? "black" : "white"
  );
  let isAlliedTargeted = e.target.firstChild?.classList.contains(
    Game.turn === "white" ? "white" : "black"
  );

  targetId = Number(
    e.target.getAttribute("square-id") ||
      e.target.parentNode.getAttribute("square-id")
  );

  let valid = Game.checkValidation(targetId);

  if (isCorrectPieceMoved) {
    if (isAlliedTargeted) {
      return;
    }
    if (valid) {
      if (draggedElement.id === "king" || draggedElement.id === "rook") {
        draggedElement.setAttribute("moved", true);
      }
      if (
        draggedElement.id === "king" &&
        Math.abs(startPositionId - targetId) === 2
      ) {
        if (targetId > startPositionId) {
          Game.board[targetId - 1].appendChild(
            Game.board[targetId + 2].firstChild
          );
        } else {
          Game.board[targetId + 1].appendChild(
            Game.board[targetId - 1].firstChild
          );
        }
      }
      if (isCorrectPieceTaken) {
        e.target.parentNode.append(draggedElement);
        Game.pieces.splice(Game.pieces.indexOf(e.target), 1);
        e.target.remove();
        if (checkIsKingExposed()) {
          Game.board[startPositionId].appendChild(draggedElement);
          Game.board[targetId].appendChild(e.target);
          return;
        }

        Game.changeTurn();
        return;
      }
      e.target.appendChild(draggedElement);
      if (!checkIsKingExposed()) {
        Game.changeTurn();
        return;
      } else {
        Game.board[startPositionId].appendChild(draggedElement);
        if (e.target.hasChildNodes()) {
          Game.board[targetId].appendChild(e.target);
        }
      }
    }

    // if (taken) {
    //   //display info to player
    //   return;
    //}
  }
}

function dragOver(e) {
  e.preventDefault();
}

function dragStart(e) {
  startPositionId = e.target.parentNode.getAttribute("square-id");
  draggedElement = e.target;
}

const gameBoard = document.getElementById("board");
const playerDisplay = document.getElementById("player");
const infoDisplay = document.getElementById("info-display");
const resetbtn = document.getElementById("reset");

resetbtn.addEventListener("click", () => Game.setBoard());

const Game = new Board();
