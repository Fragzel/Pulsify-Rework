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
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe" src={props.project.avatarImage}>
            </Avatar>
          }
          title={<Typography variant="h6">{titleText}</Typography>}
          subheader={<Typography variant="subtitle2">{subheaderText}</Typography>}
        />
        <CardMedia
          component="img"
          height="194"
          image={props.project.songImage}
          alt="Paella dish"
        />
        <CardContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {prompt}
            <p style={{ "paddingTop": "5px" }}>Play count : {props.project.playCount} </p>
            <p style={{ "paddingTop": "5px" }}>UpVoteCount : {props.project.upVoteCount} </p>
            {props.project.audio && <audio type='file' controls src={props.project.audio} ></audio>}          </Typography>
        </CardContent>

      </Card>
      <div>
        {props.project.lyrics ? <div style={{ "marginLeft": "30px" }}>Lyrics</div> : <></>}
        <CardContent
          sx={{
            maxWidth: 400,
            marginLeft: 2,
            height: 450, // Set to match the approximate height of the left card
            overflowY: 'auto', // Enable scrolling when content overflow
            padding: 2,
            boxSizing: 'border-box',
          }}
        >
          {typedLines && typedLines.map((line, index) => (
            <Typography variant="body2" key={index} sx={{ marginBottom: 1 }}>
              {line}
            </Typography>
          ))}
        </CardContent>
      </div>
      {/* Collapsed content displayed by default on the right with scroll */}

    </Box >
  );
}
