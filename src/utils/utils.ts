export function getKingAttackerAxis(
  type: string,
  start: number,
  kingPos: number
) {
  this.axis = [];
  let temp = start;

  switch (type) {
    case "rook":
      temp = start;
      if (start % 8 === kingPos % 8) {
        //Y axis
        if (start > kingPos) {
          while (temp - 8 !== kingPos) {
            temp -= 8;
            this.axis.push(temp);
          }
        } else {
          while (temp + 8 !== kingPos) {
            temp += 8;
            this.axis.push(temp);
          }
        }
      }
      if (Math.floor(start / 8) === Math.floor(kingPos / 8)) {
        //X this.axis
        if (start > kingPos) {
          while (temp - 1 !== kingPos) {
            temp -= 1;
            this.axis.push(temp);
          }
        } else {
          while (temp + 1 !== kingPos) {
            temp += 1;
            this.axis.push(temp);
          }
        }
      }

      return this.axis;
    case "bishop":
      temp = start;
      if (start % 7 === kingPos % 7) {
        if (start > kingPos) {
          while (temp - 7 !== kingPos) {
            temp -= 7;
            this.axis.push(temp);
          }
        } else {
          while (temp + 7 !== kingPos) {
            temp += 7;
            this.axis.push(temp);
          }
        }
      }
      if (start % 9 === kingPos % 9) {
        if (start > kingPos) {
          while (temp - 9 !== kingPos) {
            temp -= 9;
            this.axis.push(temp);
          }
        } else {
          while (temp + 9 !== kingPos) {
            temp += 9;
            this.axis.push(temp);
          }
        }
      }
      return this.axis;
    case "queen":
      return getKingAttackerAxis("bishop", start, kingPos).concat(
        getKingAttackerAxis("rook", start, kingPos)
      );
  }
}
