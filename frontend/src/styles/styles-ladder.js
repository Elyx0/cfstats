import styled,{ keyframes } from 'styled-components';
import { media } from './styles-utils';

export const LadderWrapper = styled.div`
    display:flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    justify-content: space-between;
   
`;

export const LadderHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    padding:10px;
    font-weight: bold;
    color: #000;
`;

export const LadderSigma = styled.span`
    color: #ccc;
    font-size:12px;
`;

export const LadderBlockContent = styled.div`
    
`;
export const LadderScore = styled.div`
    color: #888;
    display: flex;
    align-items: center;
    img {
        padding-left:3px;
    }
`;

export const LadderRank = styled.div`
    
`;



export const LadderRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    flex-grow: 1;
    background: #eee;
    padding:12px;
    //margin:5px;
    cursor: pointer;
    &:hover {
        div {
            font-weight: bold;
        }
        ${LadderScore} {
            color: black;
        }
        ${LadderRank} {
            color: black;
        }
        ${LadderSigma} {
            color:black;
        }
    }
`;

export const LadderBlock = styled.div`
    display:flex;
    flex-direction: column;
    flex-flow: 1;
    flex-grow: 1;
    border-bottom: 1px solid #ccc;
    ${LadderRow}:nth-child(odd) {
        background: #f9f9f9;
    }
`;






export const LadderName = styled.div`
    max-width: 100%;
    overflow: hidden;
    color: #008cba;
    font-family:Roboto;
    text-overflow: ellipsis;
`;

export const LadderChoice = styled.div`
    
`;

export const LadderContent = styled.div`
    
`;