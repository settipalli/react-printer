import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            location: {}
        };
        this.navigator = window.navigator;
    }

    // utility methods
    updateLocation() {
        window.navigator.geolocation.getCurrentPosition(
            // successCallback
            (position) => {
                this.setState({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                });
                this.reverseGeoCode(position.coords.latitude, position.coords.longitude);
            },

            // errorCallback
            (error) => {
                console.log("Error fetching geolocation. " + error.message);
            },

            // not more than 10 minutes old
            {maximumAge: 600000}
        );
    }

    // utilized by updateLocation
    reverseGeoCode(lat, lng) {
        let url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(jsonData => {
                this.setState({
                    location: {
                        ...this.state.location,
                        addr: JSON.parse(JSON.stringify(jsonData))
                    }
                });
            })
            .catch(error => console.error('Error:', error));
    }

    componentDidMount() {
        this.updateLocation();
    }

    render() {
        return (
            <div>
                <h1>Latitude: {this.state.location.lat}</h1>
                <h1>Longitude: {this.state.location.lng}</h1>
            </div>
        );
    }
}

export default App;
