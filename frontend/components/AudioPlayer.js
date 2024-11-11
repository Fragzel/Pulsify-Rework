import React, { useState, useEffect } from 'react';

const AudioPlayer = () => {
    const [audioUrl, setAudioUrl] = useState(null);

    // Fonction pour récupérer l'URL audio depuis le backend
    const fetchAudioUrl = async () => {
        try {
            const response = await fetch('http://localhost:3000/projects/get-audio-url'); // URL du backend
            const data = await response.json();

            if (data.audioUrl) {
                setAudioUrl(data.audioUrl); // Stocke l'URL de l'audio
            } else {
                console.error('Audio non trouvé.');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l’audio :', error);
        }
    };

    // Charger l'URL audio au montage du composant
    useEffect(() => {
        fetchAudioUrl();
    }, []);

    return (
        <div>
            {audioUrl ? (
                <audio controls>
                    <source src={audioUrl} type="audio/mpeg" />
                    Votre navigateur ne supporte pas l'élément audio.
                </audio>
            ) : (
                <p>Chargement de l’audio...</p>
            )}
        </div>
    );
};

export default AudioPlayer;