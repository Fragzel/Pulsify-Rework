import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';

const useTypingEffect = (fullText, speed = 25) => {
  const [displayedText, setDisplayedText] = React.useState('');
  React.useEffect(() => {
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

export default function SunoProjectCard() {
  // Applying typing effect to all texts
  const titleText = useTypingEffect("Shrimp and Chorizo Paella", 50);
  const subheaderText = useTypingEffect("September 14, 2016", 50);
  const descriptionText = useTypingEffect(
    "This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of frozen peas along with the mussels, if you like.",
    20
  );

  const fullMethodText = `
    Heat 1/2 cup of the broth in a pot until simmering, add saffron and set aside for 10 minutes.
    Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high heat.
    Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly browned, 6 to 8 minutes.
    Transfer shrimp to a large plate and set aside, leaving chicken and chorizo in the pan. Add pimentón,
    bay leaves, garlic, tomatoes, onion, salt and pepper, and cook, stirring often until thickened and fragrant,
    about 10 minutes. Add saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
    Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook without stirring,
    until most of the liquid is absorbed, 15 to 18 minutes. Reduce heat to medium-low, add reserved shrimp and
    mussels, tucking them down into the rice, and cook again without stirring, until mussels have opened and
    rice is just tender, 5 to 7 minutes more. (Discard any mussels that don't open.)
    Set aside off of the heat to let rest for 10 minutes, and then serve.
  `;
  const methodText = useTypingEffect(fullMethodText, 10);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <Card sx={{ maxWidth: 345 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
              R
            </Avatar>
          }

          title={<Typography variant="h6">{titleText}</Typography>}
          subheader={<Typography variant="subtitle2">{subheaderText}</Typography>}
        />
        <CardMedia
          component="img"
          height="194"
          image="/static/images/cards/paella.jpg"
          alt="Paella dish"
        />
        <CardContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {descriptionText}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>


        </CardActions>
      </Card>

      {/* Collapse content displayed by default on the right */}
      <CardContent sx={{ maxWidth: 400, marginLeft: 2 }}>
        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          {methodText}
        </Typography>
      </CardContent>
    </Box>
  );
}
