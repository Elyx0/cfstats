import React, { PureComponent } from 'react';
import {
    GameHistoryChoice,
    GameHistoryWrapper,
    GameHistoryHeader,
    GameHistoryContent,
    GameHistoryBlock,
    GameHistoryRow,
    GameHistoryScore,
    GameName,
    GameHistoryRank,
    GameTeamComposition,
    WinningTeam,
    Player,
    Rank,
    RankChange,
    Name,
    LosingTeamScore,
    WinningTeamScore,
    PlotContainer,
    LosingTeam,
    GameExpected,
    GameTime,
    GameHistoryBlockContent,
} from '../styles/styles-gamehistory';
import { LadderSigma } from '../styles/styles-ladder';
import Plot from 'react-plotly.js';
import { push } from 'connected-react-router';

const RATIO = 100;

class GameHistory extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tab: '2v2',
        }
        this.renderList = this.renderList.bind(this);
    }

    renderList(id,users,matches) {

        // Get rank
        const getRank = (id,bracketKey) => ~~((users[id][bracketKey].mu - 3 * users[id][bracketKey].sigma)*RATIO);

        // Get name
        const renderName = p => {
            let name = p.name ? p.name : 'DeletedUser#' + p.playerID;
                    name = name.length > 30 ? name.slice(0,27) + '...' : name;
            return name;
        };

        const formatPlayer = (p,g) => {
            const pObj = users[p];
            const pIndexInMatch = g.playersID.indexOf(p);
            const pRankObj = g.ratings[pIndexInMatch];
            const pRank = ~~((pRankObj.mu - 3 * pRankObj.sigma)*RATIO);
        //    / debugger;
            const pChange = ~~(g.ratingsChange[pIndexInMatch]*RATIO)
            // debugger;
            return <Player isMainPlayer={p==id} key={p} sign={pChange >= 0 ? true : false}>
                <Name  onClick={() => this.props.dispatch(push(`/user/${p}`))}>{renderName(pObj)}</Name><RankChange> {pChange >= 0? '+' : ''}{pChange}</RankChange><Rank>{pRank}</Rank>
            </Player>
        };

        const getPlotly = (pID,games) => {
           
            return {
                y: games.map(g => {
                    const pIndexInMatch = g.playersID.indexOf(+pID);
                    const pRankObj = g.ratings[pIndexInMatch];
                    const pRank = ~~((pRankObj.mu - 3 * pRankObj.sigma)*RATIO);
                    return pRank
                }),
                x: games.map(g => g.playedAt)
            }
        };

        const userMatches = Object.keys(matches).sort((x,y) => y-x).map(m => matches[m]).filter(x => x.playersID.includes(+id));
        const ladder = {};
        userMatches.forEach(m => {
            const { teamSize } = m; 
            const bracket = teamSize + 'v' + teamSize;
            if (!ladder[bracket]) ladder[bracket] = [];
            ladder[bracket].push(m);
        });
        return Object.keys(ladder).map((bracket) => {
            const games = ladder[bracket];
            const bracketKey = 'rank'+bracket[0];
            const fullRankName = bracket[0]+'v'+bracket[0];
            const rankInBracket = getRank(id,bracketKey);
            const pObj = users[id];
            return <GameHistoryBlock key={bracket}>
                <GameHistoryHeader>{bracket} ({rankInBracket} <LadderSigma> ± {~~pObj[bracketKey].sigma*100}</LadderSigma>)  </GameHistoryHeader>
            
               <Plot 
                    layout={{title: `${renderName(pObj)} ${fullRankName} rank`}}
                    data={[
                        getPlotly(id,games)
                    ]}
                />
                {games.slice(0,100).map((g)=>{
                    const gameURL = `http://forum.curvefever.com/achtung/match/${g.matchID}`;
                    const playedData = new Date(g.playedAt);
                    const toLocaleTime = playedData.toLocaleTimeString();
                    const toLocaleDate = playedData.toLocaleDateString();
                    const playerWon = g.winningPlayersID.includes(+id);
                    return <GameHistoryRow key={g.matchID}>
                        <GameName target="_blank" href={gameURL}>{g.name}</GameName>
                        <GameTime>{toLocaleTime} {toLocaleDate}</GameTime>
                        <GameTeamComposition userWon={playerWon}>
                            <WinningTeam>{
                                g.winningPlayersID.map(p => formatPlayer(p,g))
                            }</WinningTeam>
                            <WinningTeamScore>{g.winningRounds}</WinningTeamScore>
                            <LosingTeamScore>{g.losingRounds}</LosingTeamScore>
                            <LosingTeam>{
                                g.losingPlayersID.map(p => formatPlayer(p,g))
                            }</LosingTeam>
                        </GameTeamComposition>
                        <GameExpected>Expected win from winners: {~~(g.winProbabilityTeam1*100)}% </GameExpected>
                    </GameHistoryRow>;
                })}
            </GameHistoryBlock>
        });
    }

    render() {
       return(
        <GameHistoryWrapper>
            {Object.keys(this.props.users).length && Object.keys(this.props.matches).length && this.renderList(this.props.id,this.props.users,this.props.matches)}
        </GameHistoryWrapper>
        );
    }
}
export default GameHistory;
