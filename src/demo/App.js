import React, { Component } from 'react';
import _ from 'lodash';
import { Annotator, Tools } from '../lib';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tool: Tools.pencil,
      color: 'red',
    };
  }

  render() {
    return (
      <div className="annotator-container">
        <div className="tool-bar" style={{ height: '200px' }}>
          {_.map(Tools, tool => (
            <button key={tool} onClick={() => this.setState({ tool })}>
              {tool}
            </button>
          ))}
        </div>
        <Annotator
          className="annotator"
          color={this.state.color}
          height={window.innerHeight - 200}
          lineWidth={3}
          tool={this.state.tool}
          imageUrl="https://s3-us-west-2.amazonaws.com/flowmsp-test-image-bucket2/processed/demofd/dbba41f5-396e-48af-a3ca-9881062044a2/1015_Oconor_Ave_1_b4192db8_32d4_49da_a98c_f32adebee925-1024h.jpg"
        />
      </div>
    );
  }
}

export default App;
