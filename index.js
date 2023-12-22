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

    /************************
    * PLAYBACK FADER COMMANDS
    ************************/

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

      /************************
      * PLAYBACK PAGE COMMANDS
      ************************/

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

      /************************
      * MULTI FUNCTION FADER COMMANDS
      ************************/

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

      /************************
      * MFF MODE COMMANDS
      ************************/

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

      /************************
      * VIRTUAL EXECUTOR BUTTONS
      ************************/

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

      /************************
       * VIRTUAL GRAND MASTER FADER COMMANDS
       ************************/

      gmFader: {
        name: 'Grand Master Value',
        options: [
          {
            type: 'textinput',
            label: 'Fader value (0-1000)',
            id: 'gmVal',
            default: '',
            regex: Regex.NUMBER,
          },
        ],
        callback: (action) => {
          var arg = {
            type: 'i',
            value: action.options.gmVal,
          }

          sendOSC('/lampy/virtual_fader/grand_master/value', arg)
        },
      },
      gmResetButton: {
        name: 'GrandMaster Reset Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/grand_master/reset', arg)
        },
      },
      gmResetButton: {
        name: 'GrandMaster Blackout Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/grand_master/blackout', arg)
        },
      },

      /************************
      * VIRTUAL CHASE SPEED FADER COMMANDS
      ************************/

      chaseSpdFader: {
        name: 'Chase Speed Value',
        options: [
          {
            type: 'textinput',
            label: 'Fader value (0-1000)',
            id: 'chSpdVal',
            default: '',
            regex: Regex.NUMBER,
          },
        ],
        callback: (action) => {
          var arg = {
            type: 'i',
            value: action.options.chSpdVal,
          }

          sendOSC('/lampy/virtual_fader/chase_speed/value', arg)
        },
      },
      chaseSpdResetButton: {
        name: 'Chase Speed Reset Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/chase_speed/reset', arg)
        },
      },
      chaseSpdDoubleButton: {
        name: 'Chase Speed Double Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/chase_speed/double', arg)
        },
      },
      chaseSpdHalfButton: {
        name: 'Chase Speed Half Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/chase_speed/half', arg)
        },
      },
      chaseSpdPauseButton: {
        name: 'Chase Speed Pause Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/chase_speed/pause', arg)
        },
      },
      chaseSpdTapButton: {
        name: 'Chase Speed Tap Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/chase_speed/tap_speed', arg)
        },
      },

      /************************
      * VIRTUAL FX SIZE FADER COMMANDS
      ************************/

      fxSizeFader: {
        name: 'FX Size Value',
        options: [
          {
            type: 'textinput',
            label: 'Fader value (0-1000)',
            id: 'fxSizeVal',
            default: '',
            regex: Regex.NUMBER,
          },
        ],
        callback: (action) => {
          var arg = {
            type: 'i',
            value: action.options.fxSizeVal,
          }

          sendOSC('/lampy/virtual_fader/global_fx_size/value', arg)
        },
      },
      fxSizeResetButton: {
        name: 'FX Size Reset Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_size/reset', arg)
        },
      },
      fxSizeDoubleButton: {
        name: 'FX Size Double Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_size/double', arg)
        },
      },
      fxSizeHalfButton: {
        name: 'FX Size Half Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_size/half', arg)
        },
      },
      fxSizePauseButton: {
        name: 'FX Size Zero Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_size/zero', arg)
        },
      },

      /************************
      * VIRTUAL FX SPEED FADER COMMANDS
      ************************/

      fxSpeedFader: {
        name: 'FX Speed Value',
        options: [
          {
            type: 'textinput',
            label: 'Fader value (0-1000)',
            id: 'fxSpeedVal',
            default: '',
            regex: Regex.NUMBER,
          },
        ],
        callback: (action) => {
          var arg = {
            type: 'i',
            value: action.options.fxSpeedVal,
          }

          sendOSC('/lampy/virtual_fader/global_fx_speed/value', arg)
        },
      },
      fxSpeedResetButton: {
        name: 'FX Speed Reset Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_speed/reset', arg)
        },
      },
      fxSpeedDoubleButton: {
        name: 'FX Speed Double Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_speed/double', arg)
        },
      },
      fxSpeedHalfButton: {
        name: 'FX Speed Half Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_speed/half', arg)
        },
      },
      fxSpeedPauseButton: {
        name: 'FX Speed Pause Button',
        options: [
        ],
        callback: (action) => {
          var arg = {
            type: 'f',
            value: 1,
          }
          sendOSC('/lampy/virtual_fader/global_fx_speed/pause', arg)
        },
      },
    })
  }
}

runEntrypoint(LampyInstance, [])
