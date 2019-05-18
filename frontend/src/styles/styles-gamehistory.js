import styled,{ keyframes } from 'styled-components';
import { media } from './styles-utils';

export const GameHistoryWrapper = styled.div`
    display:flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: space-between;
   
`;

export const GameHistoryHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    padding:10px;
    font-weight: bold;
    color: #000;
`;



export const GameHistoryBlockContent = styled.div`
    
`;

export const GameTeamComposition = styled.div`
    display: flex;
    flex-direction: column-reverse;
    ${props => props.userWon && `flex-direction: column`}
   
  
   align-items: center;
    align-self: stretch;
    justify-content: center;
    margin-top:10px;
`;

export const WinningTeam = styled.div`
    display: flex;
    flex-direction: row;
`;

export const WinningTeamScore = styled.div`
    font-size: 16px;
    font-weight: bold;
    padding:20px;
`;

export const LosingTeam = styled.div`
    display: flex;
    flex-direction: row;
`;

export const LosingTeamScore = styled.div`
    font-size: 14px;
    font-weight: bold;
    padding:20px;
`;

export const GameToolBar = styled.button`
    font-size: 12px;
    font-weight: bold;
    padding:10px;
    margin:10px;
    cursor:pointer;
    flex:1;
    svg {
        width:14px;
        height:auto;
    }
`;

export const Player = styled.div`
    display:flex;
    flex-direction: column;
    align-items: center;
    padding:5px;
    margin:5px;
    ${props => props.isMainPlayer && `
        background: #dddddd3b;
        ${Rank},${RankChange} {
            font-weight:bold;
        }
    `}
    border-radius: 10px;
    ${props => props.sign && `${RankChange} {color:green}`}
`;

export const Name = styled.div`
    font-size:11px;
    font-weight:bold;
    &:hover {
        text-decoration: underline;
    }
`;

export const RankChange = styled.div`
    color: red;
`;


export const Rank = styled.span`

`;
export const GameName = styled.a`
    font-size: 12px;
    color: #aaa;
`;

export const GameExpected = styled.div`
    font-size:11px;
    color: grey;
`;

export const GameHistoryRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
   // flex: 1;
    background: #eee;
    padding:12px;
    //margin:5px;
    cursor: pointer;

`;

export const PlotContainer = styled.div`
    
`;

export const GameTime = styled.div`
       font-size: 10px;
    color: #aaa;
`;


export const GameHistoryBlock = styled.div`
    display:flex;
    flex-direction: column;
    flex: 1;
    border-bottom: 1px solid #ccc;
    ${GameHistoryRow}:nth-child(odd) {
        background: #f9f9f9;
    }
    & + & {
        border-left: 1px solid #eee;
    }
`;

export const GameHistoryRank = styled.div`
    
`;



export const GameHistoryScore = styled.div`
    color: #888;
`;

export const GameHistoryName = styled.div`
    max-width: 100%;
    overflow: hidden;
    color: #008cba;
    font-family:Roboto;
    text-overflow: ellipsis;
`;

export const GameHistoryChoice = styled.div`
    
`;

export const GameHistoryContent = styled.div`
    
`;