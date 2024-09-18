import styles from '../styles/Profil.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';


// UserCard utilisée dans plusieurs partie du site pour display le nom d'un commentateur ou de l'auteur du projet
function UserCard(props) {

  let userIcon;
  if (props.isOnCommunityGenre) {
    userIcon = <FontAwesomeIcon icon={faUser} className={styles.faUserCommunity} />
  } else if (props.isOnExplore) {
    userIcon = <FontAwesomeIcon icon={faUser} className={styles.faUserExplore} />
  } else {
    userIcon = <FontAwesomeIcon icon={faUser} className={styles.faUser} />
  }


  const picture = props.picture === null ? userIcon : <img className={styles.profilesPic} src={props.picture} alt='photo de profil' />

  let profil =
    <div className={styles.profilesContainer}>
      {picture}
      <div className={styles.namediv}>
        <h3 className={styles.nom} > {props.firstname}</h3>
        <h4 className={props.isOnCommunityGenre ? styles.communityIdDisplay : styles.identifiant}>@{props.username}</h4>
      </div>
    </div>

  return (
    <>
      {profil}
    </>
  );
}

export default UserCard;
