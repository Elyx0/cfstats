import React, { PureComponent } from 'react';
import {
    LadderChoice,
    LadderWrapper,
    LadderHeader,
    LadderContent,
    LadderBlock,
    LadderRow,
    LadderScore,
    LadderName,
    LadderRank,
    LadderSigma,
    LadderBlockContent,
} from '../styles/styles-ladder';
import { push } from 'connected-react-router';

import arrowUp from '../assets/arrow_up.png';
import arrowDown from '../assets/arrow_down.png';
import equal from '../assets/equal.png';

const arrowForScore = diff => {
    if (diff === undefined) return equal;
    if (diff == 0) return equal;
    if (diff > 0) return arrowDown;
    return arrowUp;
}

const renderScoreDiff = diff => {
    if (diff === undefined) diff = 0;
    if (Math.abs(diff) < 2) return '';
    return diff*-1
}
class Ladder extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tab: '2v2',
        }
        this.renderList = this.renderList.bind(this);
    }

    renderList(ladder) {
        return Object.keys(ladder).map((bracket,bracketNum) => {
            const players = ladder[bracket];
            return <LadderBlock key={bracket}>
                <LadderHeader>{bracket.replace('ladder','')} Speed</LadderHeader>
                {players.sort((p1,p2)=> {
                    let pRank1 = p1['rank'+(bracketNum+2)];
                    let pRank2 = p2['rank'+(bracketNum+2)];
                    const p1Rank = ~~((pRank1.mu - 3*pRank1.sigma)*100);
                    const p2Rank = ~~((pRank2.mu - 3*pRank2.sigma)*100);
                    return p2Rank-p1Rank;
                }).map((p,ranking)=>{
                    let pRank = p['rank'+(bracketNum+2)]
                    let name = !!p.name ? p.name : 'DeletedUser#' + p.playerID;
                    name = name.length > 30 ? name.slice(0,27) + '...' : name;
                    //pRank = ~~(pRank*10);
                    return <LadderRow key={p+ranking} onClick={() => this.props.dispatch(push(`/user/${p.playerID}`))}>
                    <LadderScore>#{ranking+1}<img src={arrowForScore(p.diff)} />{renderScoreDiff(p.diff)}</LadderScore>
                    <LadderName>{name}</LadderName>
                    <LadderRank>{~~((pRank.mu - 3*pRank.sigma)*100)}<LadderSigma> ± {~~pRank.sigma*100}</LadderSigma></LadderRank>
                    </LadderRow>;
                })}
            </LadderBlock>
        });
    }

    render() {
       return(
        <LadderWrapper>
            {this.props.ladder && this.renderList(this.props.ladder)}
        </LadderWrapper>
        );
    }
}
export default Ladder;
