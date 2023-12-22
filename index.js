const {
  InstanceBase,
  Regex,
  runEntrypoint
} = require('@companion-module/base')

class LampyInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
  }

  async init(config) {
    this.config = config
    this.updateStatus('ok')
    this.updateActions()
  }

  async destroy() {
    this.log('debug', 'destroy')
  }

  async configUpdated(config) {
    this.config = config
  }

  getConfigFields() {
    return [{
        type: 'static-text',
        id: 'info',
        width: 12,
        label: 'Information',
        value: 'To enable OSC on Lampy, enable OSC in the Menu, Show Settings, OSC.',
      },
      {
        type: 'textinput',
        id: 'host',
        label: 'Target IP',
        tooltip: 'The IP of the Lampy console',
        width: 6,
        regex: Regex.IP,
      },
      {
        type: 'textinput',
        id: 'port',
        label: 'Target Port',
        width: 4,
        regex: Regex.PORT,
      },
    ]
  }

  updateActions() {
    const sendOSC = (cmd, arg = null) => {
      if (this.config.host && this.config.port && this.config.port > 0 && this.config.port < 65536) {
        if (arg) {
          this.log('debug', cmd + ": " + arg)
          this.oscSend(this.config.host, this.config.port, cmd, [arg])
        } else {
          this.log('debug', cmd)
          this.oscSend(this.config.host, this.config.port, cmd)
        }
      } else {
        this.log('error', 'Could not send OSC: host or port not defined')
      }
    }

    this.setActionDefinitions({
      pbFader: {
        name: 'Playback Fader Value',
        options: [{
            type: 'textinput',
            label: 'Playback fader (1-10)',
            id: 'pbId',
            default: '1',
            regex: Regex.NUMBER,
          },
          {
            type: 'textinput',
            label: 'Fader value (0-1000)',
            id: 'pbVal',
            default: '',
            regex: Regex.NUMBER,
          },
        ],
        callback: (action) => {
          var arg = {
            type: 'i',
            value: action.options.pbVal,
          }

          sendOSC('/lampy/pbf/' + action.options.pbId + '/value', arg)
        },
      },

      pbButtonPress: {
        name: 'Playback Button',
        options: [{
            type: 'textinput',
            label: 'Playback (1-10)',
            id: 'pbId',
            default: '1',
            regex: Regex.NUMBER,
          },
          {
            type: 'dropdown',
            label: 'Push / Release',
            id: 'btnAction',
            choices: [{
                id: '1.',
                label: 'Push'
              },
              {
                id: '0.',
                label: 'Release'
              },
            ],
          }

        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: action.options.btnAction,
          }

          sendOSC('/lampy/pbf/' + action.options.pbId + '/flash', arg)
        },
      },

      pbPageNextButton: {
        name: 'Playback Page +',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/pbf/page/next', arg)
        },
      },
			pbPagePreviousButton: {
				name: 'Playback Page -',
				options: [
				],
				callback: (action) => {
					var arg = {
						type: 'f',
						value: 1,
					}
					sendOSC('/lampy/pbf/page/previous', arg)
				},
			},
			pbPageTemplateButton: {
				name: 'Template Page',
				options: [
				],
				callback: (action) => {
					var arg = {
						type: 'f',
						value: 1,
					}
					sendOSC('/lampy/pbf/page/template', arg)
				},
			},

      mffFader: {
        name: 'MFF Value',
        options: [{
            type: 'textinput',
            label: 'MFF (1-30)',
            id: 'mffId',
            default: '1',
            regex: Regex.NUMBER,
          },
          {
            type: 'textinput',
            label: 'Fader value (0-1000)',
            id: 'mffVal',
            default: '',
            regex: Regex.NUMBER,
          },
        ],
        callback: (action) => {
          var arg = {
            type: 'i',
            value: action.options.mffVal,
          }

          sendOSC('/lampy/mff/' + action.options.mffId + '/value', arg)
        },
      },

      mffButtonPress: {
        name: 'MFF Button',
        options: [{
            type: 'textinput',
            label: 'MFF (1-30)',
            id: 'mffId',
            default: '1',
            regex: Regex.NUMBER,
          },
          {
            type: 'dropdown',
            label: 'Push / Release',
            id: 'btnAction',
            choices: [{
                id: '1.',
                label: 'Push'
              },
              {
                id: '0.',
                label: 'Release'
              },
            ],
          }
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: action.options.btnAction,
          }

          sendOSC('/lampy/mff/' + action.options.mffId + '/flash', arg)
        },
      },
			mffModeButton: {
        name: 'MFF Mode Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/mff/mode/mode_button', arg)
        },
      },
			mffModeFixtureButton: {
				name: 'MFF Mode Fixture',
				options: [
				],
				callback: (action) => {
					var arg = {
						type: 'f',
						value: 1,
					}
					sendOSC('/lampy/mff/mode/fixture', arg)
				},
			},
			mffModeGroupButton: {
				name: 'MFF Mode Group',
				options: [
				],
				callback: (action) => {
					var arg = {
						type: 'f',
						value: 1,
					}
					sendOSC('/lampy/mff/mode/group', arg)
				},
			},
			mffModeSceneButton: {
				name: 'MFF Mode Scene',
				options: [
				],
				callback: (action) => {
					var arg = {
						type: 'f',
						value: 1,
					}
					sendOSC('/lampy/mff/mode/scene', arg)
				},
			},
      execButtonPress: {
        name: 'Executor Button',
        options: [{
            type: 'textinput',
            label: 'Executor (1-40)',
            id: 'execId',
            default: '1',
            regex: Regex.NUMBER,
          },
          {
            type: 'dropdown',
            label: 'Push / Release',
            id: 'btnAction',
            choices: [{
                id: '1.',
                label: 'Push'
              },
              {
                id: '0.',
                label: 'Release'
              },
            ],
          }
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: action.options.btnAction,
          }
          sendOSC('/lampy/virtual_executor/' + action.options.execId + '/flash', arg)
        },
      },
    })
  }
}

runEntrypoint(LampyInstance, [])
