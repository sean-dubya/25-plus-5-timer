// import logo from './logo.svg';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

const origState = {
  // <SessionTime />
  sessionLength: 25,

  // <BreakTime />
  breakLength: 5,

  // <Timer />
  isPaused: true,   // start/stop
  isSession: true,   // which timer is counting down
  timerID: 0,
  timeLeft: 25 * 60000
}

class Clock extends React.Component {
  constructor(props) {
    super(props);

    this.state = origState;

    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.start = this.start.bind(this);
    this.reset = this.reset.bind(this);
  }

  increment(e) {
    let value = e.target.value;
    let length;

    if (value === 'session') {
      if (this.state.sessionLength < 60) {
        length = this.state.sessionLength + 1;
        this.setState({ 
          sessionLength: length,
          timeLeft: length * 60000
        })
      }
    } else if (value === 'break') {
      if (this.state.breakLength < 60) {
        length = this.state.breakLength + 1;
        this.setState({ 
          breakLength: length,
          timeLeft: length * 60000
        })
      }
    }
  }

  decrement(e) {
    let value = e.target.value;
    let length;
    if (value === 'session') {
      if (this.state.sessionLength > 1) {
        length = this.state.sessionLength - 1;
        this.setState({ 
          sessionLength: length,
          timeLeft: length * 60000
        })
      }
    } else if (value === 'break') {
      if (this.state.breakLength > 1) {
        length = this.state.breakLength - 1;
        this.setState({ 
          breakLength: length,
          timeLeft: length * 60000
        })
      }
    }
  }

  // Handle timer change
  timerEnded() {
    console.log('Timer Ended!')

    clearInterval(this.state.timerID)

    // TODO -- play sound!
    let beep = document.getElementById('beep');
    beep.currentTime = 0;
    beep.play();

    if (this.state.isSession) {
      console.log("isSession === true")
      this.setState({timeLeft: this.state.breakLength * 60000, isSession: false, isPaused: true})
      document.getElementById('timer-label').innerText = 'Break Time!'
      setTimeout(() => {document.getElementById('timer-label').innerText = 'Break Timer'}, 2000)
      this.start();
    } else {
      console.log("isSession === false")
      this.setState({timeLeft: this.state.sessionLength * 60000, isSession: true, isPaused: true});
      document.getElementById('timer-label').innerText = 'Break is Over!';
      setTimeout(() => {document.getElementById('timer-label').innerText = 'Session Timer'}, 2000)
      this.start();
    }
  }


  start() {
    if (this.state.isPaused) {
      let timerID = setInterval(() => {
        
        // BUG -- Timer not reaching zero!
        if (this.state.timeLeft !== 0) {
          // decrement time in state
          this.setState({timeLeft: this.state.timeLeft - 1000});
        } else {
          this.timerEnded();
        }
      }, 1000);

      this.setState({timerID: timerID, isPaused: false});
    } else {
      clearInterval(this.state.timerID);
      this.setState({isPaused: true})
    }
  }

  reset() {
    clearInterval(this.state.timerID);
    this.setState(origState);
    document.getElementById('timer-label').innerText = 'Session Timer'
    document.getElementById('beep').pause()
    document.getElementById('beep').currentTime = 0;
  }

  render() {

    return (
      <Container 
        fluid='lg' 
        lg={6} 
        className="App"
      >
        <Row>
          <Col>
            <div id='title'>25 + 5 Clock</div>
          </Col>
        </Row>
        <Row className='justify-content-center'>
          <Col lg={3}>
            <BreakTime 
              increment={this.increment}
              decrement={this.decrement}
              break={this.state.breakLength}
            />
          </Col>
          <Col lg={3}>
            <SessionTime 
              increment={this.increment}
              decrement={this.decrement}
              session={this.state.sessionLength}
            />
          </Col>
        </Row>
        <Row>
          <Timer 
            timeLeft={this.state.timeLeft}
            isPaused={this.state.isPaused}
            isSession={this.state.isSession}
            start={this.start}
            reset={this.reset}
          />
        </Row>
        <audio id='beep' src="https://freesound.org/data/previews/198/198841_285997-lq.mp3"></audio>
      </Container>
    );
  }
}

// TODO: Abstract this component for both break and session time
//  add another passed prop for timerType, use to compute strings
class BreakTime extends React.Component {
  render() {
    return (
      <Container id='break-time'>
        <Row >
          <p id='break-label'>Break Length</p>
          <Col >
            <button 
              id='break-decrement' 
              onClick={this.props.decrement}
              value='break'
            ><i className='fa fa-arrow-down'></i></button> 
          </Col>
          <Col>
            <p id='break-length' className='align-self-center'>{this.props.break}</p>
          </Col>
          <Col>
            <button 
              id='break-increment' 
              onClick={this.props.increment}
              value='break'
            ><i className='fas fa-arrow-up'></i></button>
          </Col>
        </Row>
      </Container>
    )
  }
}

class SessionTime extends React.Component {
  render() {
    return (
      <Container id='session-time'>
        <Row >
          <p id='session-label'>Session Length</p>
          <Col >
            <button 
              id='session-decrement' 
              onClick={this.props.decrement}
              value='session'
            ><i className='fa fa-arrow-down'></i></button> 
          </Col>
          <Col>
            <p id='session-length'>{this.props.session}</p>
          </Col>
          <Col>
            <button 
              id='session-increment' 
              onClick={this.props.increment}
              value='session'
            ><i className='fa fa-arrow-up'></i></button>
          </Col>
        </Row>
      </Container>
    )
  }
}

class Timer extends React.Component {

  prettyTime(ms) {
    let minutes = Math.floor(ms / (1000 * 60))
    let seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return `${minutes}:${seconds}`;
  }

  render() {
    let isSession = this.props.isSession
    return (
      <div id='timer'>
        <p id='timer-label'>{isSession ? 'Session Timer' : 'Break Timer'}</p>
        <p id='time-left'>{this.prettyTime(this.props.timeLeft)}</p>
        <button 
          id='start_stop'
          onClick={this.props.start}
        ><i className={`fa fa-${this.props.isPaused ? 'play' : 'pause'}`}></i></button>
        <button 
          id='reset'
          onClick={this.props.reset}
        ><i className='fa fa-recycle'></i></button>
      </div>
    )
  }
}

export default Clock;
