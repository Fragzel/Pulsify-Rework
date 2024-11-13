import * as React from 'react';
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

  fullText && React.useEffect(() => {
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
  const titleText = useTypingEffect(props.project.name, 50);
  const subheaderText = useTypingEffect(props.project.author, 50);
  const prompt = useTypingEffect(props.project.prompt, 20);


  const fullMethodText = props.project.lyrics;

  // Splitting the lyrics text by newlines and applying typing effect
  let lines;
  let typedLines;
  if (fullMethodText != "" && fullMethodText != undefined) {
    lines = fullMethodText.split('\n')
    typedLines = lines.map((line, index) => useTypingEffect(line, 20));

  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <Card sx={{ maxWidth: 345, height: 500 }}>
        <CardMedia
          component="img"
          height="194"
          image={props.project.songImage}
          alt="Suno song image"
          sx={{ position: 'absolute', top: '10vh', left: 0, width: '100%', height: '70vh', objectPosition: 'center 40%', zIndex: 1 }}
        />
        <CardHeader
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
            {prompt}
            <p style={{ "paddingTop": "5px" }}>Play count : {props.project.playCount} </p>
            <p style={{ "paddingTop": "5px" }}>UpVoteCount : {props.project.upVoteCount} </p>
            {props.project.audio && <audio type='file' controls src={props.project.audio} ></audio>}          </Typography>
        </CardContent>

      </Card>
      <div style={{ zIndex: 2, marginTop: '-20px' }}>
        {props.project.lyrics ? <div style={{ "marginLeft": "30px" }}>Lyrics</div> : <></>}
        <CardContent
          sx={{
            maxWidth: 400,
            marginLeft: 2,
            height: 450, // Set to match the approximate height of the left card
            overflowY: 'auto', // Enable scrolling when content overflow
            padding: 2,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 2,
            borderRadius: '4px'
          }}
        >
          {typedLines && typedLines.map((line, index) => (
            <Typography variant="body2" key={index} sx={{ marginBottom: 1, color: 'rgba(0, 0, 0, 0.6)' }}>
              {line}
            </Typography>
          ))}
        </CardContent>
      </div>
      {/* Collapsed content displayed by default on the right with scroll */}

    </Box >
  );
}
