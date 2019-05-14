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
                <LadderHeader>{bracket.replace('ladder','')}</LadderHeader>
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
                    <LadderScore>#{ranking+1}</LadderScore>
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
