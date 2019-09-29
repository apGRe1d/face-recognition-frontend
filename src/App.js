import React, {Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

// using react-particles-js 
const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    },
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signIn',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super(); 
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: { 
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  componentDidMount() {
    const localIsSignedIn = localStorage.getItem('isSignedIn') === 'true';
    const localRoute = localIsSignedIn ? localStorage.getItem('route') : 
     localStorage.getItem('route') === 'register' ? 'register' :
     localStorage.getItem('route') === 'signIn' ? 'signIn' :
     '';
    const localName = localIsSignedIn ? localStorage.getItem('name') : '';
    const localEntries = localIsSignedIn ? localStorage.getItem('entries') : '';
    const localId = localIsSignedIn ? localStorage.getItem('id') : '';
    this.setState({
      route: localRoute,
      isSignedIn: localIsSignedIn,
      user: {
        name: localName,
        entries: localEntries,
        id: localId
      }
    });
  }

  localRouteChange = () => {
    const { route, isSignedIn } = this.state;
    const {id, name, entries} = this.state.user;
    localStorage.setItem('route', route);
    localStorage.setItem('isSignedIn', isSignedIn);
    localStorage.setItem('id', id);
    localStorage.setItem('name', name);
    localStorage.setItem('entries', entries);
  };

  /*getting the coordinates through clarifai API and making a function that calculate face location */
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)     
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box}); 
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('https://evening-spire-78692.herokuapp.com/imageurl', {
        method: 'post', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response =>  {
         if (typeof(response) === "object") {
          fetch('https://evening-spire-78692.herokuapp.com/image', {
            method: 'put', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              /*Object.assign method is using for not to update the entire object*/
              this.setState(Object.assign(this.state.user, {entries: count}), () => {this.localRouteChange()});           
            })
            .catch(console.log)
         }
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signOut') {
      this.setState(initialState, () => {this.localRouteChange()})
    } else if (route === 'home') {
      this.setState({isSignedIn: true}, () => {this.localRouteChange()})
    }
    this.setState({route: route}, () => {this.localRouteChange()});
  }

  render () {
    const { isSignedIn, imageUrl, route, box} = this.state;
    const { name, entries } = this.state.user;
    return (
      <div className="App">
       <Particles className='particles'
           params={particlesOptions}
        />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} localRouteChange={this.localRouteChange}/>
      {route === 'home'
        ? <div>
            <Logo />
            <Rank name={name} entries={entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div>
        : (
            route === 'signIn' 
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} localRouteChange={this.localRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} localRouteChange={this.localRouteChange}/>
          )        
      }
      </div>
    );
  }
}
export default App;

