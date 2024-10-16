import styles from '../styles/MessageCard.module.css';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faTrash } from '@fortawesome/free-solid-svg-icons';
import ReportModal from './ReportModal';
import UserCard from './UserCard'


function MessageCard(props) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const user = useSelector((state) => state.user.value)
    const [modalIsOpen, setIsOpen] = useState(false);

    // Ouvre et ferme la modale de report
    const openReportModal = () => {
        setIsOpen(true)
    }
    const closeReportModal = () => {
        setIsOpen(false)
    }

    // Vérifie que l'utilisateur connecté est l'auteur du commentaire ou non
    const isCommentPoster = user.email === props.userId.email;

    // Fonction qui permet d'effacer un commentaire de la base de donnée
    const removeComment = async () => {
        const response = await fetch(`${siteUrl}/projects/comment`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                projectId: props.idProject,
                commentId: props.comments._id,
                userId: props.userId._id
            }),
        });
        const result = await response.json()
        if (result.result) {
            props.refresh();
        } else {
            console.error('Failed to delete comment:', result.message);
        }
    }


    return (
        <div className={styles.listItemContainer}>
            <div className={styles.listItemTitle} onClick={() => props.answerHandler(props.userId.username)}>
                <UserCard
                    firstname={props.userId.firstname} username={props.userId.username} picture={props.userId.picture}
                />
            </div>
            <div className={styles.listItemMessage}>
                {props.comment}
            </div>
            <div className={styles.iconContainer}>
                <FontAwesomeIcon icon={faCircleExclamation} onClick={() => openReportModal()} className={styles.icon} />
                {isCommentPoster && (
                    <FontAwesomeIcon icon={faTrash} className={styles.icon} onClick={() => removeComment()} />
                )}
            </div>
            <ReportModal isOpen={modalIsOpen}
                onRequestClose={closeReportModal}
                userId={props.userId}
                comment={props.comment}
                idProject={props.idProject}
            />
        </div>

    );
}

export default MessageCard;
