import * as React from 'react';
import styles from '../styles/SunoProjectCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import Box from '@mui/material/Box';


// Custom hook for typing effect
const useTypingEffect = (fullText, speed = 10) => {
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    if (!fullText) return;
    let index = 0;

    const timer = setInterval(() => {
      setDisplayedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [fullText, speed]);

  return displayedText;
};

export default function RecipeReviewCard(props) {

  // Example texts with typing effect
  const titleText = useTypingEffect(props.project.name, 70);
  const subheaderText = useTypingEffect(props.project.author, 70);
  const prompt = useTypingEffect(props.project.prompt, 30);
  const negativePrompt = useTypingEffect(props.project.negative, 30);

  // Utiliser le hook pour l'ensemble des paroles comme une seule chaîne
  const lyricsText = props.project.lyrics || "________________ Instrumental ________________";
  const typedLyrics = useTypingEffect(lyricsText, 1);

  const [imageClass, setImageClass] = React.useState(styles.imageHidden);
  const [currentImage, setCurrentImage] = React.useState(props.project.songImage);


  React.useEffect(() => {
    setImageClass(styles.imageHidden);
    const timer = setTimeout(() => {
      setCurrentImage(props.project.songImage);
      setImageClass(styles.imageVisible);
    }, 1200); // Délai pour s'assurer que l'image est chargée avant de commencer la transition
    return () => clearTimeout(timer);
  }, [props.project.songImage]);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'flex-start',
      marginInline: 'auto',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '4px',
      maxHeight: '60vh',
      marginTop: '1vh',
    }}>
      <Card sx={{ maxWidth: 345, maxHeight: '60vh', minWidth: '30vw' }}>
        <CardMedia
          component="img"
          height="194"
          image={currentImage}
          alt="Suno song image"
          className={imageClass}
          sx={{ position: 'absolute', top: '10vh', left: 0, width: '100%', height: '73vh', objectPosition: 'center 40%', zIndex: 1 }}
        />
        <CardHeader
          className={styles.cardHeader}
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', position: 'relative', zIndex: 2 }}
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="avatar" src={props.project.avatarImage}>
            </Avatar>
          }
          title={<Typography variant="h6">{titleText}</Typography>}
          subheader={<Typography variant="subtitle2">{subheaderText}</Typography>}
        />
        <CardContent sx={{ backgroundColor: 'rgba(240, 230, 240, 0.7)', position: 'relative', zIndex: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Style of Music : {prompt}
            {negativePrompt && <p style={{ "paddingTop": "5px" }}>Exclude Styles : {negativePrompt}</p>}
            <p style={{ "paddingTop": "5px" }}>Plays : {props.project.playCount} <br />
              Likes : {props.project.upVoteCount} </p>
            {props.project.audio && <audio type='file' controls src={props.project.audio} style={{ justifyContent: 'center', width: '100%', height: '65px' }}></audio>}
          </Typography>
        </CardContent>
      </Card>
      <div style={{ zIndex: 1, marginTop: '-20px' }}>
        {props.project.lyrics ? <div style={{ "marginLeft": "30px" }}>Lyrics</div> : null}
        {props.project.lyrics && <CardContent
          sx={{
            maxWidth: 400,
            maxHeight: '60vh',
            marginLeft: 2,
            height: 450,
            overflowY: 'auto',
            padding: 2,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '4px',
          }}
        >
          {typedLyrics.split('\n').map((line, index) => (
            <Typography variant="body2" key={index} sx={{ marginBottom: 1, color: 'rgba(0, 0, 0, 0.6)' }}>
              {line}
            </Typography>
          ))}
        </CardContent>}
      </div>
    </Box>
  );
}
