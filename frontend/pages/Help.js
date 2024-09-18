import styles from "../styles/Help.module.css"
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

function Help() {
    const router = useRouter();
    const user = useSelector((state => state.user.value));

    !user.token && router.push({ pathname: '/' });
    const handleBack = () => {
        router.back();
    };

    return (
        <body className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>Aide</h1>
                <video className={styles.video} controls src="https://res.cloudinary.com/duiieokac/video/upload/v1723733550/aouccn1xvoz79jdhaiov.mp4"></video>
                <div>
                    <p className={styles.text}>1. Ouvrez Suno AI: <a href={'https://suno.com/'} style={{ textDecoration: 'none' }} target='_blank' rel="noopener noreferrer"><span className={styles.link} >Cliquez ici</span></a></p>
                    <p className={styles.text}>2. Cliquez sur "Create"</p>
                    <p className={styles.text}>3. Cliquez sur "Custom"</p>
                    <p className={styles.text}>4. Renseignez votre prompt dans le champ "Styles of music"</p>
                    <p className={styles.text}>5. Générez un nouveau morceau de Suno en cliquant "Create"</p>
                    <p className={styles.text}>6. Ecoutez et attribuez une note au résultat sur Pulsify</p>
                </div>
            </div>
            <button className={styles.btn} onClick={handleBack}>Retour</button>

        </body>
    )
}

export default Help;
