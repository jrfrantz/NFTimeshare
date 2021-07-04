import { NFT } from "./nft";

export const Redeemable = (props) => {
  if (!props.nfts) {
    return null; // loading indicator
  }
  return (
    <div>
      <div className='row'>
        <div className='items-container'>
          {props.nfts.map((nft, i) => (
            <div className='col-sm-6 col-md-4 col-lg-4 item' key={`nft-${i}`}>
              <NFT {...nft} />
              <div className='item-button-container'>
                <div className='btn btn-custom btn-lg page-scroll' onClick={nft.onClickButton}>
                  {nft.buttonText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  </div>
  );
}
