import styles from '../styles/ModelCard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import UserCard from './UserCard';


function ModelCard(props) {


    let removeButton = <></>
    props.isOwnGenre && (removeButton =
        <div className={styles.trashIcon} onClick={() => props.handleRemoveGenre(props.genre)}>
            <FontAwesomeIcon icon={faTrashCan}></FontAwesomeIcon>
        </div>)

    return (
        <button className={styles.listItemContainer}>
            <div className={styles.author} onClick={() => props.handleClick(props.genre, props.isCommunity)}>
                <UserCard username={props.username} firstname={props.firstname} picture={props.picture} isOnCommunityGenre={props.isOnCommunityGenre} ></UserCard>
            </div>
            <div className={styles.genre} onClick={() => props.handleClick(props.genre, props.isCommunity)}>{props.genre}</div>
            <div className={styles.listItemPrompt} onClick={() => props.handleClick(props.genre, props.isCommunity)}>{props.projects}</div>
            {removeButton}
        </button>

    );
}

export default ModelCard;
