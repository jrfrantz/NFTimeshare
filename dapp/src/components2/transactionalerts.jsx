import { Alert, Link, Toast } from 'react-bootstrap'
export const TransactionAlerts = (props) => {

// could have an alert when your tx is sent (pending, go check etherscan)
// or once it's completed (Heads up it takes a while to show up on this site)
// go check opensea (need contract+token links) or etherscan (need tx link)
// need to know if it's redeem or deposit
// [ {tx: asdf, contract: blah, tokenId: blah, status: blah, method: REDEEM} ]

  function getAlertProps(txn) {
    console.log('in getAlertProps');
    var alertProps = {
      show: true,
      etherscan_url: `https://etherscan.io/tx/${txn.txHash}`,
    }
    switch (txn.method) {
      case "REDEEM":
        alertProps.method = "Deposit ";
        break;
      case "DEPOSIT":
        alertProps.method = "Redeem ";
        break;
    }
    switch (txn.status) {
      case "PENDING":
        alertProps.status = "pending"
        alertProps.variant = "info"
        break;
      case "SUCCESS":
        alertProps.status = "succeeded"
        alertProps.variant = "success"
        break;
      case "ERROR":
        alertProps.status = "failed"
        alertProps.variant = "danger"
        break;
    }
    return alertProps
  }
  var notifPinStyle = {
   position: 'fixed',
   top: '12px',
   right: '12px',
   zIndex: '100'
  }
  console.log("in map with ", props.txnAlerts)
  return (
    <div className="notification-container" style={notifPinStyle}>
      {props.txnAlerts.map((txn, i) => {

        var alertProps = getAlertProps(txn);
        return (
          <Toast key={`txn_alert_${i}`} {...alertProps}
            onClose = {() => props.dismissFunc(txn)}>
            <Toast.Header>
              {alertProps.method + ' ' + alertProps.status}
            </Toast.Header>
            Your transaction has been sent to the Ethereum network and can be viewed
            {' '}
            <a href={alertProps.etherscan_url}
              target="_blank" rel="noopener noreferrer">
              on etherscan.
            </a>
            {' '}
            Note that it can take some time to be reflected on nftimeshares.fun
          </Toast>
        )
      })
      }
    </div>
  )
}

// Your {deposit | redeem } has been sent to the ethereum network.
// You can view your transaction at [etherscan]{etherscan link}
// Note that it can take some time to be reflected on nftimeshares.fun
// [Close modal, which should just remove it from the txn queue]
