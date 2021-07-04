import { NFT } from "./nft";
import ReactModal from 'react-modal';
import contractAddress from "../contracts/contract-address.json"

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
    },
};

export const Modal = (props) => {
    const nft = props.modalState && props.modalState.nft;
    console.log("in modal, nft is ", nft);
    const depositThisNft = async () => {
      if (!nft) {
        console.log("no nft to deposit");
        return;
      }
      let contractAddr = nft.asset_contract.address;
      let tokenId      = nft.token_id;
      await props.depositFunc(contractAddr, tokenId);
    }
    const redeemThisNft = async () => {
      if (!nft) {
        console.log("no nft to redeem");
        return;
      }
      let timeshareMonthTokenId = nft.token_id;
      await props.redeemFunc(timeshareMonthTokenId)
    }

    return (
        <ReactModal
            isOpen={!!props.modalState}
            onRequestClose={props.closeModal}
            style={customStyles}
            contentLabel="Example Modal">
            <div className='modal-container'>
                <NFT {...nft} />
                <p>
                    Two transactions will happen.
                    The first grants approval to wrap your asset.
                    The second deposits it and mints you new NFTimeshares.
                </p>
                <div className='item-button-container'>
                    <div className='btn btn-custom btn-lg page-scroll'
                      onClick={nft && nft.action === "redeem" ? redeemThisNft : depositThisNft}>
                        Let's do it!
                    </div>
                </div>
            </div>
        </ReactModal>
    )
}
