import * as React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/base/Button';
import { Popper } from '@mui/base/Popper';
import { styled } from '@mui/system';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';



const Autocomplete = React.forwardRef(function Autocomplete(props, ref) {
  const {
    disableClearable = false,
    disabled = false,
    readOnly = false,
    inputValue,
    setInputValue,
    options,
    ...other
  } = props;

  const [popupOpen, setPopupOpen] = React.useState(false);
  const inputRef = React.useRef(null);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setPopupOpen(false); // Ferme le menu si clic en dehors
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    // Nettoyage de l'événement lors du démontage
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} {...other}>
      <StyledAutocompleteRoot
        className={popupOpen ? 'focused' : undefined}
        onClick={() => setPopupOpen(!popupOpen)}
      >
        <StyledInput
          ref={inputRef} // Utilisation de la référence de l'input pour positionner Popper
          disabled={disabled}
          readOnly={readOnly}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Choisissez un genre'
        />
        {inputValue && (
          <StyledClearIndicator onClick={() => setInputValue('')}>
            <ClearIcon />
          </StyledClearIndicator>
        )}
        <StyledPopupIndicator onClick={() => setPopupOpen(!popupOpen)}>
          <ArrowDropDownIcon
            style={{ transform: popupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </StyledPopupIndicator>
      </StyledAutocompleteRoot>
      {popupOpen && (
        <Popper open={popupOpen} anchorEl={inputRef.current} placement="top-start">
          <StyledListbox>
            {options.length > 0 ? (
              options.map((option, index) => (
                <StyledOption key={index}>{option.label}</StyledOption>
              ))
            ) : (
              <StyledNoOptions>Aucune option disponible</StyledNoOptions>
            )}
          </StyledListbox>
        </Popper>
      )}
    </div>
  );
});

Autocomplete.propTypes = {
  disableClearable: PropTypes.oneOf([false]),
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default function AutocompleteIntroduction({ genresList }) {
  const [options, setOptions] = React.useState(
    genresList.map((genre) => ({ label: genre.genre }))
  );
  const [inputValue, setInputValue] = React.useState('');



  return (
    <div >
      <Autocomplete
        options={options}
        inputValue={inputValue}
        setInputValue={setInputValue}
      />
    </div>
  );
}

AutocompleteIntroduction.propTypes = {
  genresList: PropTypes.arrayOf(
    PropTypes.shape({
      genre: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Color Themes
const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

// Styled Components
const StyledAutocompleteRoot = styled('div')(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
    border-radius: 8px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'};
    display: flex;
    gap: 0px;
    padding-right: 5px;
    overflow: hidden;
    width: 20vh;
    height: 5vh;

    &.focused {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
    }

    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }
`
);

const StyledInput = styled('input')(
  ({ theme }) => `
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 400;
    line-height: 1.5;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: inherit;
    border: none;
    padding: 8px 12px;
    outline: 0;
    flex: 1 0 auto;
  `
);

const StyledClearIndicator = styled(Button)(
  ({ theme }) => `
    outline: 0;
    box-shadow: none;
    border: 0;
    border-radius: 4px;
    background-color: transparent;
    align-self: center;
    padding: 0 2px;

    &:hover {
      background-color: ${theme.palette.mode === 'dark' ? grey[700] : blue[100]};
      cursor: pointer;
    }

    & > svg {
      transform: translateY(2px) scale(0.9);
    }
  `
);

const StyledPopupIndicator = styled(Button)(
  ({ theme }) => `
    outline: 0;
    box-shadow: none;
    border: 0;
    border-radius: 4px;
    background-color: transparent;
    align-self: center;
    padding: 0 2px;

    &:hover {
      background-color: ${theme.palette.mode === 'dark' ? grey[700] : blue[100]};
      cursor: pointer;
    }

    & > svg {
      transform: translateY(2px);
    }
  `
);

const StyledListbox = styled('ul')(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    padding: 6px;
    margin: 12px 0;
    min-width: 20vh;
    border-radius: 12px;
    overflow: auto;
    outline: 0;
    max-height: 300px;
    z-index: 1;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    box-shadow: 0px 4px 6px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.3)' : 'rgba(0,0,0, 0.05)'};
  `
);

const StyledOption = styled('li')(
  ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 8px;
    cursor: default;

    &:hover {
      cursor: pointer;
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    }

    &[aria-selected=true] {
      background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }
  `
);

const StyledNoOptions = styled('li')`
  list-style: none;
  padding: 8px;
  text-align: center;
  color: ${props => props.theme.palette.mode === 'dark' ? grey[300] : grey[700]};
`;


