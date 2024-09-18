import styles from '../styles/ArrowDiagram.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';


const SvgArrow = (props) => {

    switch (props.type) {

        case 'doubleArrow':
            return (
                <>
                    <svg width="200" height="180">
                        <line x1="10" y1="50" x2="90" y2="65" stroke=" white" strokeWidth="2" />
                        <line x1="10" y1="135" x2="90" y2="120" stroke=" white" strokeWidth="2" />
                        <line x1="90" y1="65" x2="90" y2="120" stroke=" white" strokeWidth="2" />
                        <line x1="90" y1="93" x2="180" y2="93" stroke=" white" strokeWidth="2" />
                        <polygon points="180,88 180,98 190,93" fill="white" />
                    </svg>
                </>
            ); break;

        case 'simpleArrow':
            return (
                <>
                    <svg width="150" height="100">
                        <line x1="10" y1="30" x2="130" y2="30" stroke=" white" strokeWidth="2" />
                        <polygon points="130,25 130,35 140,30" fill="white" />
                    </svg>
                </>
            ); break;


    }
};

const ArrowDiagram = () => {
    return (
        <>
            <div className={styles.diagramText}>
                <div>Sans Pulsify</div>
                <div>Avec Pulsify</div>
            </div>

            <div className={styles.arrowGroup}>
                <div className={styles.diagramArrows}>
                    <SvgArrow type={'simpleArrow'} />
                </div>
                <div className={styles.diagramArrows}>
                    <SvgArrow type={'simpleArrow'} />
                </div>
            </div>

            <div className={styles.diagramText}>
                <div>200 essais</div>
                <div>20 essais</div>
            </div>
            <div>
                <SvgArrow type={'doubleArrow'} />
            </div>

            <FontAwesomeIcon
                icon={faFaceSmile}
                className={styles.faceSmile}
            />
        </>
    );
};

export default ArrowDiagram;