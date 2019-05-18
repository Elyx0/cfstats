import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { fetchUser, addPin, removePin } from '../actions/statsActions';

import { BounceOutLeft, BounceInRight } from 'animate-css-styled-components';
import {
  LandingWrapper,
  ContentWrapper,
  Heading,
  Button,
  ExplainWrapper,
  ErrorWrapper,
  Footer,
} from '../styles/styles-landing';

import { GameToolBar } from '../styles/styles-gamehistory';

import Loader from '../components/Loader';
import GameHistory from '../components/GameHistory';
import demo from '../assets/demo.png';
import { endPoint } from '../components/Api';


class UserPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
        timer: null,
    };
    this.fetchUser = this.fetchUser.bind(this);
    this.isInFav = this.isInFav.bind(this);
  }
  componentDidMount() {
    window.scrollTo(0, 0);
   //; // Fetches only initial user
    console.log('mounted');
    // const interval = setInterval(this.fetchUser,10000);
    this.fetchUser(this.props.match.params.id);
    // this.setState({timer:interval})
  }
  componentWillReceiveProps(nextProps,prevState) {
    // /  console.log(nextProps);
      if (this.state.id !== nextProps.match.params.id) {
        const id = nextProps.match.params.id;
          this.setState({id})
        
          this.fetchUser(id);
          clearInterval(this.state.timer);
          const interval = setInterval(()=>{this.fetchUser(id)},60000);
          this.setState({timer:interval})
      }
  }
//   componentWillUpdate() {
//       this.fetchUser();
//   }
  componentWillUnmount() {
   // clearInterval(this.state.timer);
  }

  
  fetchUser(id) {
    // Leveraging react-redux return value
    console.log('Fetching!')
    return this.props.dispatch(fetchUser(id));
  }

  noop() {}


  renderErrors() {
    return (
      <ErrorWrapper>{this.state.error ? `${this.state.error} 🙄` : ''}</ErrorWrapper>
    );
  }

  isInFav() {
    return this.props.pins[this.props.match.params.id];
  }

  render() {
    return (
      <LandingWrapper>
      <GameToolBar onClick={()=> this.props.dispatch(this.isInFav(this.props.match.params.id) ? removePin(this.props.match.params.id) : addPin(this.props.match.params.id))}><svg version='1' xmlns='http://www.w3.org/2000/svg' width='1072' height='1706.667'
      viewBox='0 0 804.000000 1280.000000'>
          <path d='M4195 12773 c-282 -14 -570 -86 -740 -186 -146 -85 -250 -227 -274 -374 -6 -37 -23 -412 -37 -833 l-25 -765 -466 -1401 -467 -1401 -121 -12 c-362 -35 -661 -162 -918 -389 -246 -217 -405 -476 -462 -752 -24 -111 -24 -323 -2 -440 98 -506 505 -1025 1127 -1438 80 -53 148 -99 153 -102 4 -3 -51 -204 -122 -446 -71 -241 -238 -810 -371 -1264 -133 -454 -342 -1167 -465 -1585 -123 -418 -253 -863 -290 -989 -56 -191 -65 -230 -54 -241 19 -17 52 -26 65 -17 5 4 203 416 439 917 235 501 619 1315 852 1810 234 495 483 1025 555 1178 105 222 134 277 147 271 75 -30 307 -101 432 -133 438 -111 852 -132 1197 -61 488 101 824 383 966 811 160 482 92 983 -190 1405 l-64 97 18 31 c31 51 1469 2284 1530 2376 54 80 89 113 615 566 307 265 581 503 608 530 198 195 209 472 34 839 -198 412 -616 849 -1149 1199 -350 230 -817 456 -1206 585 -469 156 -939 232 -1315 214z'
          transform='matrix(.1 0 0 -.1 0 1280)' />
      </svg><span>{this.isInFav() ? 'Remove from' : 'Add to'} favorites</span></GameToolBar>
        <ContentWrapper>
         
          <GameHistory id={this.props.match.params.id} users={this.props.users} matches={this.props.matches} totalMatches={this.props.matches.length} dispatch={this.props.dispatch} />
        </ContentWrapper>

        <ExplainWrapper>
        <p>This data was computed by resetting ranks as of March 1st and applying your gspeed wins/loses since then</p>
        TrueSkill is a rating system among game players. It was developed by Microsoft Research and has been used on Xbox LIVE for ranking and matchmaking service. This system quantifies players’ TRUE skill points by the Bayesian inference algorithm. It also works well with any type of match rule including N:N team game or free-for-all.
          <br /><br />ELO sucks, Trueskill is more accurate for team:<br />
         <p>
         <a href="https://trueskill.org/">Trueskill</a>
         <a href="https://us.forums.blizzard.com/en/overwatch/t/glicko-trueskill-instead-of-elo-for-sr/81368">TRUESKILL INSTEAD OF ELO FOR SR?</a>
         <a href="https://www.quora.com/Is-TrueSkill%E2%84%A2-the-best-ranking-system-for-multiplayer-games">Is TrueSkill™ the best ranking system for multiplayer games?</a>
         <a href="http://forums.euw.leagueoflegends.com/board/showthread.php?t=436055">Why Elo vs. TrueSkill?</a>
         </p>
        </ExplainWrapper>
        <Footer>
          <a href="https://github.com/Elyx0" title="GitHub"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414"><path d="M8 0C3.58 0 0 3.582 0 8c0 3.535 2.292 6.533 5.47 7.59.4.075.547-.172.547-.385 0-.19-.007-.693-.01-1.36-2.226.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.725-.496.056-.486.056-.486.803.056 1.225.824 1.225.824.714 1.223 1.873.87 2.33.665.072-.517.278-.87.507-1.07-1.777-.2-3.644-.888-3.644-3.953 0-.873.31-1.587.823-2.147-.083-.202-.358-1.015.077-2.117 0 0 .672-.215 2.2.82.638-.178 1.323-.266 2.003-.27.68.004 1.364.092 2.003.27 1.527-1.035 2.198-.82 2.198-.82.437 1.102.163 1.915.08 2.117.513.56.823 1.274.823 2.147 0 3.073-1.87 3.75-3.653 3.947.287.246.543.735.543 1.48 0 1.07-.01 1.933-.01 2.195 0 .215.144.463.55.385C13.71 14.53 16 11.534 16 8c0-4.418-3.582-8-8-8"></path></svg></a><a  href="https://medium.com/@Elyx0/" title="Medium"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414"><path d="M11.824 12.628l-.276.45.798.398 2.744 1.372c.15.076.294.11.418.11.278 0 .467-.177.467-.492V5.883l-4.15 6.745zm4.096-8.67c-.004-.003 0-.01-.003-.012l-4.825-2.412c-.06-.03-.123-.038-.187-.044-.016 0-.03-.01-.047-.01-.184 0-.368.092-.467.254l-.24.39-.5.814-1.89 3.08 1.89 3.076.5.813.5.812.59.95 4.71-7.64c.02-.03.01-.06-.02-.08zm-6.27 7.045L7.17 6.97l-.295-.477-.294-.477-.25-.416v4.867l3.32 1.663.5.25.5.25-.5-.813-.5-.813zM.737 1.68L.59 1.608c-.085-.042-.166-.062-.24-.062-.206 0-.35.16-.35.427v10.162c0 .272.2.594.442.716l4.145 2.08c.107.06.208.08.3.08.257 0 .438-.2.438-.53V4.01c0-.02-.012-.04-.03-.047L.738 1.68z"></path></svg></a>
          <a href="https://twitter.com/Elyx0" title="Twitter"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414"><path d="M16 3.038c-.59.26-1.22.437-1.885.517.677-.407 1.198-1.05 1.443-1.816-.634.375-1.337.648-2.085.795-.598-.638-1.45-1.036-2.396-1.036-1.812 0-3.282 1.468-3.282 3.28 0 .258.03.51.085.75C5.152 5.39 2.733 4.084 1.114 2.1.83 2.583.67 3.147.67 3.75c0 1.14.58 2.143 1.46 2.732-.538-.017-1.045-.165-1.487-.41v.04c0 1.59 1.13 2.918 2.633 3.22-.276.074-.566.114-.865.114-.21 0-.416-.02-.617-.058.418 1.304 1.63 2.253 3.067 2.28-1.124.88-2.54 1.404-4.077 1.404-.265 0-.526-.015-.783-.045 1.453.93 3.178 1.474 5.032 1.474 6.038 0 9.34-5 9.34-9.338 0-.143-.004-.284-.01-.425.64-.463 1.198-1.04 1.638-1.7z" fillRule="nonzero"></path></svg></a><a href="https://codepen.io/Elyx0" title="CodePen"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414"><path d="M15.988 5.443c-.004-.02-.007-.04-.012-.058l-.01-.033c-.006-.017-.012-.034-.02-.05-.003-.012-.01-.023-.014-.034l-.023-.045-.02-.032-.03-.04-.024-.03c-.01-.013-.022-.026-.034-.038l-.027-.027-.04-.032-.03-.024-.012-.01L8.38.117c-.23-.155-.53-.155-.76 0L.305 4.99.296 5c-.012.007-.022.015-.032.023-.014.01-.027.02-.04.032l-.027.027-.034.037-.024.03-.03.04c-.006.012-.013.022-.02.033l-.023.045-.015.034c-.007.016-.012.033-.018.05l-.01.032c-.005.02-.01.038-.012.058l-.006.03C.002 5.5 0 5.53 0 5.56v4.875c0 .03.002.06.006.09l.007.03c.003.02.006.04.013.058l.01.033c.006.018.01.035.018.05l.015.033c.006.016.014.03.023.047l.02.03c.008.016.018.03.03.042.007.01.014.02.023.03.01.012.02.025.034.036.01.01.018.02.028.026l.04.033.03.023.01.01 7.31 4.876c.116.078.248.117.382.116.134 0 .266-.04.38-.116l7.314-4.875.01-.01c.012-.007.022-.015.032-.023.014-.01.027-.02.04-.032l.027-.027.034-.037.024-.03.03-.04.02-.032.023-.046.015-.033.018-.052.01-.033c.005-.02.01-.038.013-.058 0-.01.003-.02.004-.03.004-.03.006-.06.006-.09V5.564c0-.03-.002-.06-.006-.09l-.007-.03zM8 9.626L5.568 8 8 6.374 10.432 8 8 9.626zM7.312 5.18l-2.98 1.993-2.406-1.61 5.386-3.59v3.206zM3.095 8l-1.72 1.15v-2.3L3.095 8zm1.237.828l2.98 1.993v3.208l-5.386-3.59 2.406-1.61zm4.355 1.993l2.98-1.993 2.407 1.61-5.387 3.59v-3.206zM12.905 8l1.72-1.15v2.3L12.905 8zm-1.237-.827L8.688 5.18V1.97l5.386 3.59-2.406 1.61z" fillRule="nonzero"></path></svg></a>
        </Footer>
      </LandingWrapper>
    );
  }
}

const mapStateToProps = state => {
  return state.stats;
}
export default connect(mapStateToProps)(UserPage);
