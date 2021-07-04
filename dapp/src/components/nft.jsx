export const NFT = (props) => { // TODO add month if applicable
    return (
        <a href={props.clickImageUrl} target="_blank" className='hover-bg item-img-container'>
            <div className='hover-text'>
                <h4>{props.name}</h4>
            </div>
            <img
                src={props.img}
                className='img-responsive item-img'
            />
        </a>
    );
}
