import styles from '../styles/Report.module.css';
import React from "react";
import Modal from 'react-modal';

import { useState } from 'react';
import { useSelector } from 'react-redux'



function ReportModal(props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const [commentaire, setCommentaire] = useState('')
  const user = useSelector((state) => state.user.value)

  const handleValidation = async () => {
    if (props.id) {
      try {
        const report = await fetch(`${siteUrl}/projects/reportProject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idPrompt: props.id,
            text: commentaire,
            token: user.token,
            email: user.email
          }),
        });
        const response = await report.json()
        props.onRequestClose()
        if (!response.result) {
          Error('Erreur lors de la validation du report');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }

    if (props.comment) {
      try {
        const report = await fetch(`${siteUrl}/projects/reportComment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: props.userId,
            comment: props.comment,
            idProject: props.idProject,
            text: commentaire,
            token: user.token,
            email: user.email
          }),
        });
        const response = await report.json()
        props.onRequestClose()
        if (!response.result) {
          Error('Erreur lors de la validation du report');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };





  return (

    <Modal
      isOpen={props.isOpen}
      className={styles.modalContainer}
      onRequestClose={props.onRequestClose}
      contentLabel="Example Modal">
      <div className={styles.content}>
        <div className={styles.modalTitleContent}>
          <h1 className={styles.modalTitle}>Report</h1>
        </div>
        <div>
          <p className={styles.text}>Signalez un commentaire innaproprié ou offensant </p>
        </div>
        <div className={styles.promptContainer} >
          <textarea placeholder="Expliquer votre report ici..." className={styles.input} onChange={e => setCommentaire(e.target.value)} value={commentaire}>
          </textarea>
        </div>
        <div className={styles.modalBtnContainer}>
          <button className={styles.btn} onClick={props.onRequestClose}>Annuler</button>
          <button className={styles.btn} onClick={handleValidation}>Valider</button>
        </div>
      </div>
    </Modal >


  )
}



export default ReportModal;
