import React, { Fragment } from 'react';
import { connect } from 'react-redux'
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions
} from 'react-native';
import { Image } from 'react-native-elements'
import { ConnectableObservable } from 'rx';

class PreviewElementScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitleStyle: {
        color: 'white'
      },
      headerStyle: {
        backgroundColor: '#003366'
      },
      headerTitle: 'Element Preview'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      params: props.navigation.state.params,
      imageUri: null
    }
    console.log('PARAMS:', props.navigation.state.params.index);
  }

  goBackToEdit() {
    this.props.navigation.navigate(this.state.params.back);
  }

  goBack() {
    this.props.navigation.navigate(this.state.params.back, { inspectionId: this.props.currentInspection.inspectionId });
  }

  componentDidMount() {
    this.props.navigation.setParams({ saveImage: this.saveImage });
  }

  componentWillUnmount() {
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      this.setState({ imageUri: data.uri });
      console.log(data.uri);
    }
  };

  goToCamera() {
    this.setState({ imageUri: null });
  }

  render() {
    let { imageUri } = this.state;
    let { caption, timestamp, geo } = this.state.params.item;
    let readableTimestamp = new Date(timestamp).toDateString();
    let readonly = this.props.navigation.getParam('readonly', false);
    let uri = this.props.navigation.getParam('imageUri', null);

    // Saved images store their geo data as an array. Images coming from the camera
    // store their geo data as an object.
    let lat;
    let lon;
    if (Array.isArray(geo)) {
      lat = geo[0];
      lon = geo[1];
    } 
    else if (typeof geo === 'object' && geo !== null ) {
      lat = geo.latitude;
      lon = geo.longitude;
    }

    const win = Dimensions.get('window');

    if (readonly) {
      imageUri = uri;
    }

    console.log("URI:", uri);
    // Preview of image that has already been saved
    return (
      <ScrollView>
        <View style={styles.container}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ScrollView
              maximumZoomScale={2.5}
              minimumZoomScale={1}
              pinchGestureEnabled={true}
            >
              <Image
                style={{ width: win.width, height: 540 }}
                source={{ uri: imageUri }}
                resizeMode='contain'
              />
            </ScrollView>
          </View>
          <View style={{ margin: 25 }}>
            {!lat || !lon
              ? <Text>No GPS data available</Text>
              : <Fragment>
                  <Text>Lat: {lat}</Text>
                  <Text>Lon: {lon}</Text>
                </Fragment>
            }
            <Text>Caption: {caption}</Text>
            <Text>Timestamp: {readableTimestamp}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}

function mapStoreStateToProps(storeState) {
  return {
    inspections: storeState.models.inspections,
    currentUser: storeState.auth.currentUser,
    projects: storeState.models.projects,
    currentInspection: storeState.models.currentInspection,
    items: storeState.models.items,
    requestError: storeState.ui.requests.error,
  };
}
export default connect(mapStoreStateToProps)(PreviewElementScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: 50
  }
});
