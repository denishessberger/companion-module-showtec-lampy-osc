const { InstanceBase, Regex, runEntrypoint } = require('@companion-module/base')

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
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					'To enable OSC on Lampy, enable OSC in the Menu, Show Settings, OSC.',
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
				name: 'Set a playback faders level',
				options: [
					{
						type: 'textinput',
						label: 'Playback fader (1-10)',
						id: 'pbId',
						default: '1',
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Fader value (0-100 %)',
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

			pbButton: {
				name: 'Playback Button',
				options: [
					{
						type: 'textinput',
						label: 'Playback (1-10)',
						id: 'pbId',
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: (action) => {
					sendOSC('/lampy/pbf/' + action.options.pbId + '/flash', arg)
				},
			},

			execute: {
				name: 'Execute',
				options: [
					{
						type: 'textinput',
						label: 'Execute Page',
						id: 'exeP',
						default: '1',
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Execute Nr',
						id: 'exeNr',
						default: '1',
						regex: Regex.NUMBER,
					},
					{
						type: 'textinput',
						label: 'Execute Level: 0 = Release, 1 = Activate, 2-100 = Encoder Level',
						id: 'exeVal',
						default: '1',
						regex: Regex.NUMBER,
					},
				],
				callback: (action) => {
					var arg = {
						type: 'i',
						value: parseInt(action.options.exeVal),
					}
					sendOSC('/exec/' + action.options.exeP + '/' + action.options.exeNr, arg)
				},
			},

			dbo: {
				name: 'Desk Black Out DBO',
				options: [
					{
						type: 'dropdown',
						label: 'On / Off',
						id: 'dboId',
						choices: [
							{ id: '1', label: 'Black Out On' },
							{ id: '0', label: 'Black Out Off' },
						],
					},
				],
				callback: (action) => {
					var arg = {
						type: 'i',
						value: action.options.dboId,
					}
					sendOSC('/dbo', arg)
				},
			},
		})
	}
}

runEntrypoint(LampyInstance, [])
