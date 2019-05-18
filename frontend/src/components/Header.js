import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { doLogout } from '../actions/inboxActions';
import SvgIcon from '../components/SvgIcon';
import Logout from '../components/Logout';
import ServerStatus from '../components/ServerStatus';
import { push } from 'connected-react-router';
import { endPoint } from '../components/Api';
const HeaderWrapper = styled.div`
  border-bottom: 1px solid;
  border-color: ${props => props.theme.colors.borderGrey};
  padding: .2rem 1rem;
  display:flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.colors.backgroundGrey};
`;

const LogoutStatusWrapper = styled.div`
  flex-flow: row nowrap;
  display: flex;
`

const Suggestion = styled.span`
  font-size: 12px;
  padding-left:5px;
  cursor:pointer;
  text-decoration: underline;
`

const SearchBlock = styled.div``;
const SvgWrapper = styled.div`
width: 10%;
    height: 100%;
    display: block;
`;

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      debounce: null,
      suggestions: [],
    }
    this.handleChange = this.handleChange.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
    this.renderPins = this.renderPins.bind(this);
  }
  renderSearch(suggestions) {
    return suggestions.slice(0,8).map(s => {
      return <Suggestion key={s.playerID}  onClick={() => this.props.dispatch(push(`/user/${s.playerID}`))}>{s.name.slice(0,30)}</Suggestion>
    });
  }
  renderPins() {
    return Object.keys(this.props.pins).map(pID => {
      const s = this.props.users[pID];
      return <Suggestion key={s.playerID}  onClick={() => this.props.dispatch(push(`/user/${s.playerID}`))}>{s.name.slice(0,30)}</Suggestion>
    });
  }
  handleChange(event) {
    clearTimeout(this.state.debounce);
    const {value} = event.target;
    let suggestions = [];
    const debounce = setTimeout(async()=>{
        try {
      const resSuggestions = await (await fetch(`${endPoint}/search/${value}`,{
        method: 'GET',
      })).json();
      suggestions = resSuggestions.data.players;
     
    } catch(e){} finally {
      this.setState({suggestions});
    }
    },1500);
    this.setState({debounce});
  }
  render() {
    const { dispatch } = this.props;
    return (
      <HeaderWrapper>
      <SvgWrapper onClick={() => { dispatch(push('/')) }}>
      <SvgIcon />
      </SvgWrapper>
      {this.renderPins()}
      <SearchBlock>
      🔎<input type="text" onChange={this.handleChange} />
          {this.renderSearch(this.state.suggestions)}
      </SearchBlock>
    <LogoutStatusWrapper>

      <ServerStatus />
    </LogoutStatusWrapper>

  </HeaderWrapper>
    );
  }
}
const mapStateToProps = state => {
  return state.stats;
}
export default connect(mapStateToProps)(Header);
