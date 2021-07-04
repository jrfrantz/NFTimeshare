import React from "react"
export const AwardTestNFTButton = (props) => {
    return (
      <div>
        <p> Hey2 </p>
        <button
        className="btn btn-warning"
        type="button"
        onClick={() => props.contract.awardTestNFT()}
        >
          Get Test NFT
      </button>
    </div>
    );
}
