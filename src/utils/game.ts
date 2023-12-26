import * as CONSTANTS from "../constants/constants";
import { MyHtmlDivElement, MyNode } from "./types";
import { getKingAttackerAxis } from "./utils";

export declare interface Board {
  pieces: Array<MyNode>;
  mate: null | "black" | " white";
  board: Array<MyNode>;
  turn: "black" | "white";
  dragged: any;
  start: number;
  target: number;
}

//@ts-ignore:disable-next-line
Number.prototype.isBetween = function (min, max) {
  return this >= min && this <= max;
};

export class Board {
  constructor() {
    this.pieces = [];
    this.mate = null;
    this.board = [];
    this.turn = "white";
  }

  getPieceMoves = function (type, start) {
    let i = 1;
    this.moves = [];
    this.blocked = {};

    switch (type) {
      case "knight":
        return CONSTANTS.knightMoves
          .map((m) => m + start)
          .filter(
            (m) =>
              Math.abs((start % 8) - (m % 8)) < 3 &&
              Math.floor(start / 8) !== Math.floor(m / 8) &&
              this.board[m] &&
              (!this.board[m].hasChildNodes() ||
                !this.board[m].firstChild.firstChild.classList.contains(
                  this.board[start].firstChild.firstChild.classList[0]
                ))
          );
      case "king":
        const availableCastle: Array<number> = []; //
        if (!this.board[start].firstChild.hasAttribute("moved")) {
          if (
            this.board[start - 3].firstChild &&
            !this.board[start - 2].hasChildNodes() &&
            !this.board[start - 1].hasChildNodes() &&
            this.board[start - 3].firstChild.id === "rook" &&
            !this.board[start - 3].firstChild.hasAttribute("moved")
          ) {
            availableCastle.push(start - 2);
          }
          if (
            this.board[start + 4].firstChild &&
            !this.board[start + 3].hasChildNodes() &&
            !this.board[start + 2].hasChildNodes() &&
            !this.board[start + 1].hasChildNodes() &&
            this.board[start + 4].firstChild.id === "rook" &&
            !this.board[start + 4].firstChild.hasAttribute("moved")
          ) {
            availableCastle.push(start + 2);
          }
        }

        return CONSTANTS.kingMoves
          .map((m) => m + start)
          .filter(
            (i) =>
              this.board[i] &&
              (!this.board[i].hasChildNodes() ||
                (this.board[i].hasChildNodes() &&
                  !this.board[i].firstChild.firstChild.classList.contains(
                    this.board[start].firstChild.firstChild.classList[0]
                  ) &&
                  !this.pieceGotSupport(i)))
          )
          .concat(availableCastle);
      case "pawn":
        if (
          Math.floor(start / 8) === 1 &&
          !this.board[start + 8].hasChildNodes() &&
          !this.board[start + 16].hasChildNodes()
        ) {
          this.moves.push(start + 16);
        } else if (
          Math.floor(start / 8) === 6 &&
          !this.board[start - 8].hasChildNodes() &&
          !this.board[start - 16].hasChildNodes()
        ) {
          this.moves.push(start - 16);
        }
        if (
          this.board[start].firstChild.firstChild.classList.contains("white")
        ) {
          if (!this.board[start - 8].hasChildNodes()) {
            this.moves.push(start - 8);
          }
          if (
            this.board[start - 7].hasChildNodes() &&
            Math.floor((start - 7) / 8) !== Math.floor(start / 8)
          ) {
            this.moves.push(start - 7);
          }
          if (
            this.board[start - 9].hasChildNodes() &&
            Math.floor((start - 9) / 8) === Math.floor(start / 8) - 1
          ) {
            this.moves.push(start - 9);
          }
        } else {
          if (!this.board[start + 8].hasChildNodes()) {
            this.moves.push(start + 8);
          }
          if (
            this.board[start + 7].hasChildNodes() &&
            Math.floor((start + 7) / 8) !== Math.floor(start / 8)
          ) {
            this.moves.push(start + 7);
          }
          if (
            this.board[start + 9].hasChildNodes() &&
            Math.floor((start + 9) / 8) === Math.floor(start / 8) + 1
          ) {
            this.moves.push(start + 9);
          }
        }

        return this.moves;
      case "bishop":
        this.blocked.diagLeftTop = false;
        this.blocked.diagRightTop = false;
        this.blocked.diagLeftBottom = false;
        this.blocked.diagRightBottom = false;

        while (i <= 8) {
          //top-left
          if (!this.blocked.diagLeftTop) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              8 * i + start + i,
              "diagLeftTop",
              start
            );
          }

          //top-right
          if (!this.blocked.diagRightTop) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              8 * i + start - i,
              "diagRightTop",
              start
            );
          }

          //bottom-left
          if (!this.blocked.diagLeftBottom) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              start - 8 * i - i,
              "diagLeftBottom",
              start
            );
          }

          //bottom-right
          if (!this.blocked.diagRightBottom) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              start - 8 * i + i,
              "diagRightBottom",
              start
            );
          }

          i++;
        }
        // console.log(
        //   "Totalthis.Moves,diag:",
        //   this.moves.map((m) => this.board[m])
        // );
        return this.moves;
      case "rook":
        this.blocked.leftRoad = false;
        this.blocked.topRoad = false;
        this.blocked.bottomRoad = false;
        this.blocked.rightRoad = false;
        i = 1;
        while (i <= 8) {
          // iterate and cheking for possible this.moves

          //left

          if (!this.blocked.leftRoad) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              start - i,
              "leftRoad",
              start
            );
          }
          //right

          if (!this.blocked.rightRoad) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              start + i,
              "rightRoad",
              start
            );
          }
          //bottom

          if (!this.blocked.bottomRoad) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              start - 8 * i,
              "bottomRoad",
              start
            );
          }

          //top
          if (!this.blocked.topRoad) {
            this.iterateAxis(
              this.moves,
              this.blocked,
              start + 8 * i,
              "topRoad",
              start
            );
          }

          i++;
        }

        // console.log(
        //   "Totalthis.MovesXY:",
        //   this.moves.map((m) => this.board[m])
        // );

        return this.moves;
      case "queen":
        const temp = this.getPieceMoves("bishop", start);
        this.getPieceMoves("rook", start).map((m) => temp.push(m));
        return temp;
    }
  };

  setBoard = function () {
    console.log("h");
    this.pieces = [];
    this.board = [];
    this.board.map((s) => {
      console.log(s);
      gameBoard?.removeChild(s);
    });
    this.board = CONSTANTS.START_PIECES.map((piece, index) => {
      const square = document.createElement("div") as MyHtmlDivElement;
      square.classList.add("square");
      square.setAttribute("square-id", index.toString());
      square.innerHTML = piece;
      square.firstChild && square.firstChild.setAttribute("draggable", true);
      const row = Math.floor((63 - index) / 8) + 1;
      if (row % 2 === 0) {
        square.classList.add(index % 2 === 0 ? "beige" : "brown");
      } else {
        square.classList.add(index % 2 === 0 ? "brown" : "beige");
      }
      if (index <= 15) {
        square.firstChild?.firstChild?.classList.add("black");
        this.pieces.push(square.firstChild);
      }
      if (index >= 48) {
        square.firstChild?.firstChild?.classList.add("white");
        this.pieces.push(square.firstChild as Node);
      }

      gameBoard?.appendChild(square);
      return square;
    });

    this.turn = "white";
    this.mate = null;

    if (infoDisplay && playerDisplay) {
      playerDisplay.textContent = this.turn;
    }
    return this.board;
  };

  pieceGotSupport = function (position) {
    const color = this.board[position].firstChild.firstChild.classList[0];

    const team = this.pieces.filter((p) =>
      p.firstChild.classList.contains(color)
    );

    const teamMoves = team.flatMap((p) =>
      this.getPieceMoves(p.id, Number(p.parentNode.getAttribute("square-id")))
    );

    return teamMoves.includes(position);
  };

  checkIfKingsthretend = function () {
    let isMate = false;
    const threated = this.pieces.flatMap((piece) => {
      return this.getPieceThreats(
        piece.id,
        Number(piece.parentNode?.getAttribute("square-id"))
      );
    });
    const threatendKing = threated.filter(
      (m) => this.board[m].firstChild.id === "king"
    );

    if (threatendKing.length > 0) {
      const enemies = this.pieces.filter(
        (p) =>
          !p.firstChild.classList.contains(
            this.board[threatendKing[0]].firstChild.firstChild.classList[0]
          )
      );

      const enemyMoves = enemies.flatMap((piece) =>
        this.getPieceMoves(
          piece.id,
          Number(piece.parentNode.getAttribute("square-id"))
        )
      );

      const possibleMoves = this.getPieceMoves("king", threatendKing[0]).filter(
        (x) => !enemyMoves.includes(x)
      );

      const attackers = enemies.filter((enemy) =>
        this.getPieceThreats(
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
      const blockers: Array<MyNode> = []; //: Array<number>

      const alliedMoves = this.pieces
        .filter((p) =>
          p.firstChild.classList.contains(
            this.board[threatendKing[0]].firstChild.firstChild.classList[0]
          )
        )
        .filter((p) => p.id !== "king")
        .flatMap((piece) => {
          const moves = this.getPieceMoves(
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
          this.board[threatendKing].firstChild.firstChild.classList[0];
        if (infoDisplay)
          infoDisplay.textContent = `${this.board[threatendKing].firstChild.firstChild.classList[0]} mated.`;
        return;
      }

      if (infoDisplay)
        infoDisplay.textContent = `${this.board[threatendKing].firstChild.firstChild.classList[0]} checked`;
    }
    if (!isMate) {
      if (this.turn === "white") {
        this.turn = "black";
      } else {
        this.turn = "white";
      }
    }
  };

  getPieceThreats = function (type, start) {
    const moves = this.getPieceMoves(type, start) || [];
    return moves.filter((move) => {
      if (
        this.board[move] &&
        this.board[move].hasChildNodes() &&
        !this.board[move].firstChild.firstChild.classList.contains(
          this.board[start].firstChild.firstChild.classList[0]
        )
      ) {
        return move;
      }
    });
  };

  checkIsKingExposed = function () {
    const enemyteam = this.pieces.filter(
      (piece) => !piece.firstChild?.classList.contains(this.turn)
    );
    const threats = enemyteam.flatMap((piece) =>
      this.getPieceThreats(
        piece.id,
        Number(piece.parentNode?.getAttribute("square-id"))
      )
    );
    const king = threats.filter((t) => this.board[t].firstChild?.id === "king");
    if (king.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  changeTurn = function (dragged, target) {
    if (dragged) {
      if (dragged.id === "pawn") {
        //pawn promotion
        if (Math.floor(target / 8) === 0 || Math.floor(target / 8) === 7) {
          const pieceIndex = this.pieces.indexOf(this.board[target].firstChild);
          this.pieces.splice(pieceIndex, 1);
          this.board[target].firstChild.remove();
          this.board[target].innerHTML =
            CONSTANTS.promotionPieces[
              Number(
                prompt("Enter a Number:1-queen   2-knight   3-bishop   4-rook")
              ) - 1
            ];
          this.board[target].firstChild.setAttribute("draggable", true);
          this.board[target].firstChild.firstChild.classList.add(this.turn);
          this.pieces.splice(pieceIndex, 0, this.board[target].firstChild);
        }
      }
    }

    if (infoDisplay) {
      infoDisplay.textContent = "";
    }

    this.checkIfKingsthretend();

    if (playerDisplay) {
      playerDisplay.textContent = this.turn;
    }
  };

  checkValidation = function (dragged, start, target) {
    const type = dragged.id;

    return this.getPieceMoves(type, start).includes(target);
  };

  getPieces = function () {
    return this.pieces;
  };

  getBoard = function () {
    return this.board;
  };

  getMate = function () {
    return this.mate;
  };

  getTurn = function () {
    return this.turn;
  };
  iterateAxis = function (moves, blocked, index, axis, start) {
    if (this.board[index] === undefined) {
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

    if (!this.board[index].hasChildNodes()) {
      //free square
      moves.push(index);
      return;
    } else if (this.board[index].hasChildNodes()) {
      //full square
      const isTargetEnemy = !this.board[
        index
      ].firstChild.firstChild.classList.contains(
        this.board[start].firstChild.firstChild.classList[0]
      );
      if (isTargetEnemy) {
        moves.push(index);
        blocked[axis] = true;
      } else {
        moves.push(index);

        blocked[axis] = true;
      }
    }
  };
}

const gameBoard = document.getElementById("board");
const playerDisplay = document.getElementById("player");
const infoDisplay = document.getElementById("info-display");
