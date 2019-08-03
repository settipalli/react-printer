import React from 'react';
import config from './config';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lat: 0,
            lng: 0,
            addr: {
                address: {
                    city: '',
                    city_district: '',
                    country: '',
                    country_code: '',
                    county: '',
                    postcode: '',
                    state: '',
                    state_district: '',
                    suburb: ''
                },
                addresstype: '',
                boundingbox: [],
                category: '',
                display_name: '',
                importance: 0.0,
                lat: '',
                licence: '',
                lon: '',
                name: '',
                osm_id: '',
                osm_type: '',
                place_id: 0,
                place_rank: 0,
                type: ''
            },
            isSignedIn: false
        };

        this.handleSignInClick = this.handleSignInClick.bind(this);
        this.handleSignOutClick = this.handleSignOutClick.bind(this);

        this.initClient = this.initClient.bind(this); // bind required to access window.gapi
        this.updateSignInStatus = this.updateSignInStatus.bind(this); // bind required to access this.setState
        this.makeApiCall = this.makeApiCall.bind(this);

    }

    // === Geocoding utility methods ===================================================================================
    updateLocation() {
        window.navigator.geolocation.getCurrentPosition(
            // successCallback
            (position) => {
                this.reverseGeoCode(position.coords.latitude, position.coords.longitude);
                this.setState({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                });
            },

            // errorCallback
            (error) => {
                console.log("Error fetching geolocation. " + error.message);
            },

            // not more than 10 minutes old
            {maximumAge: 600000}
        );
    }

    reverseGeoCode(lat, lng) {
        let url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        fetch(url)
            .then(response => {
                return response.json();
            }).then(jsonData => {
            this.setState({
                addr: jsonData
            });
        })
            .catch(error => console.error('Error:', error));
    }

    // == Google authentication utility methods ========================================================================
    initClient() {
        window.gapi.client.init({
            'apiKey': config.API_KEY,
            'clientId': config.CLIENT_ID,
            'scope': config.SCOPE,
            'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        }).then(() => {
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus);
            this.updateSignInStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
        });
    }

    handleSignInClick(event) {
        window.gapi.auth2.getAuthInstance().signIn();
    }

    handleSignOutClick(event) {
        window.gapi.auth2.getAuthInstance().signOut();
    }

    updateSignInStatus(isSignedIn) {
        this.setState((state) => ({
            isSignedIn: isSignedIn
        }));

        if (isSignedIn) {
            this.makeApiCall();
        }
    }

    makeApiCall() {
        var params = {
            // The ID of the spreadsheet to retrieve data from.
            spreadsheetId: config.SPREADSHEET_ID,

            // The A1 notation of the values to retrieve.
            range: config.RANGE,

            // How should values should be represented in the output?
            // The default render option is ValueRenderOption.FORMATTED_VALUE.
            // valueRenderOption: '',

            // How should dates, times, and durations should be represented in the output?
            // This is ignored if value_render_option is FORMATTED_VALUE.
            // The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
            // dateTimeRenderOption: '',
        };

        var request = window.gapi.client.sheets.spreadsheets.values.get(params);
        request.then(function (response) {
            console.log(response.result);
        }, function (reason) {
            console.error('error: ' + reason.result.error.message);
        });
    }

    componentDidMount() {
        this.updateLocation();
        window.gapi.load('client:auth2', this.initClient);
    }

    render() {
        const isSignedIn = this.state.isSignedIn;
        return (
            <div>
                <section className="section">
                    <div className="container">
                        <h1 className="title">Hello, Workspace</h1>
                        <p className="subtitle">Manage your files.</p>
                    </div>
                    <div className="section">
                        <div className="columns">
                            <div className="field is-grouped">
                                <div className="control">
                                    <button className={"button " + (isSignedIn ? "is-danger" : "is-link")}
                                            onClick={isSignedIn ? this.handleSignOutClick : this.handleSignInClick}>{isSignedIn ? 'Sign Out' : 'Sign In'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default App;
