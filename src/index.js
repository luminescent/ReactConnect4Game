import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <Board />
    </div>
  );
}

const Players = Object.freeze({
  red: "Red",
  black: "Black"
});

const CellState = Object.freeze({
  red: "Red",
  black: "Black",
  untouched: "Untouched"
});

class Cell extends React.Component {
  onInnerClick = evnt => {
    if (this.props.onCellClick)
      this.props.onCellClick(
        this.props.row,
        this.props.col,
        this.props.clickState
      );
  };

  render() {
    const containerStyle = {
      height: "50px",
      width: "50px",
      border: "1px solid black",
      backgroundColor: "yellow",
      display: "block"
    };

    const colour =
      this.props.clickState === CellState.red
        ? "red"
        : this.props.clickState === CellState.black
        ? "black"
        : "white";

    const innerStyle = {
      backgroundColor: colour,
      border: "1px solid black",
      borderRadius: "100%",
      paddingTop: "98%",
      display: "block"
    };

    return (
      <div style={containerStyle}>
        <div style={innerStyle} onClick={this.onInnerClick} />{" "}
      </div>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    const emptyBoard = [...Array(7).keys()].map(row =>
      [...Array(7).keys()].map(col => ({
        clickState: CellState.untouched,
        row: row,
        col: col
      }))
    );

    this.state = {
      currentPlayer: Players.red,
      board: emptyBoard,
      haveWinner: false
    };
  }

  reset = () => {
    const emptyBoard = [...Array(7).keys()].map(row =>
      [...Array(7).keys()].map(col => ({
        clickState: CellState.untouched,
        row: row,
        col: col
      }))
    );

    this.setState({
      currentPlayer: Players.red,
      board: emptyBoard,
      haveWinner: false
    });
  };

  computeNewColour = (row, col, cellColour) => {
    if (this.state.haveWinner) return;

    if (cellColour === CellState.untouched) {
      const clickState =
        this.state.currentPlayer === Players.red
          ? CellState.red
          : CellState.black;

      // now we need to compute where the cell change will happen
      // as it has to be the greater row index which is untouched

      const untouchedIndexes = this.state.board
        .map((row, index) => ({
          state: row[col].clickState,
          index: index
        }))
        .filter(c => c.state === CellState.untouched)
        .map(c => c.index);

      var changedRow = Math.max(...untouchedIndexes);

      // now we need to change the state!
      this.setState(prevState => {
        const changedBoard = prevState.board;
        changedBoard[changedRow][col].clickState = clickState;

        // has the current player won?
        var hasWon = this.playerHasWon(this.state.currentPlayer, changedBoard);

        // we change the player only if we don't have a winner
        const newPlayer = hasWon
          ? this.state.currentPlayer // keep it
          : this.state.currentPlayer === Players.red
          ? Players.black
          : Players.red;

        return {
          ...prevState,
          board: changedBoard,
          currentPlayer: newPlayer,
          haveWinner: hasWon
        };
      });
    }
  };

  playerHasWon = (player, board) => {
    const stateToFind =
      player === Players.red ? CellState.red : CellState.black;
    // find four on a row
    for (var row = 0; row < 7; row++) {
      for (var col = 0; col < 3; col++) {
        var found =
          board[row][col].clickState === stateToFind &&
          board[row][col + 1].clickState === stateToFind &&
          board[row][col + 2].clickState === stateToFind &&
          board[row][col + 3].clickState === stateToFind;

        if (found) return true;
      }
    }
    // find four on a column
    for (col = 0; col < 7; col++) {
      for (row = 0; col < 3; col++) {
        var found =
          board[row][col].clickState === stateToFind &&
          board[row + 1][col].clickState === stateToFind &&
          board[row + 2][col].clickState === stateToFind &&
          board[row + 3][col].clickState === stateToFind;

        if (found) return true;
      }
    }

    // left top to right bottom
    for (row = 0; row < 7; row++) {
      for (col = 0; col < 7; col++) {
        if (row + 3 < 7 && col + 3 < 7) {
          var found =
            board[row][col].clickState === stateToFind &&
            board[row + 1][col + 1].clickState === stateToFind &&
            board[row + 2][col + 2].clickState === stateToFind &&
            board[row + 3][col + 3].clickState === stateToFind;

          if (found) return true;
        }
      }
    }

    // find four on left bottom to top right
    for (row = 6; row >= 0; row--) {
      for (col = 0; col < 7; col++) {
        if (row - 3 >= 0 && col + 3 < 7) {
          var found =
            board[row][col].clickState === stateToFind &&
            board[row - 1][col + 1].clickState === stateToFind &&
            board[row - 2][col + 2].clickState === stateToFind &&
            board[row - 3][col + 3].clickState === stateToFind;

          if (found) return true;
        }
      }
    }

    return false;
  };

  render() {
    const header = this.state.haveWinner ? (
      <h1>Winner: {this.state.currentPlayer}</h1>
    ) : (
      <h1>{this.state.currentPlayer}'s turn</h1>
    );
    return (
      <div>
        {header}
        {this.state.board.map(row => (
          <div style={{ display: "flex" }}>
            {row.map(cell => (
              <Cell
                {...cell}
                currentPlayer={this.state.currentPlayer}
                onCellClick={this.computeNewColour}
              />
            ))}
          </div>
        ))}
        <br />
        <button onClick={() => this.reset()}>Reset</button>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
