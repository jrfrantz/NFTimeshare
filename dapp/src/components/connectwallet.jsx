import React from "react"
export const ConnectWallet = (props) => {
    if (!!props.connectedWallet) {
      return null;
    }
    return (
      <div>
        <p> Hey </p>
        <button
        className="btn btn-warning"
        type="button"
        onClick={props.connectFunc}
        >
          Connect Wallet
      </button>
    </div>
    );
}
