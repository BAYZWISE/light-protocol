use groth16_solana::groth16::Groth16Verifyingkey;

pub const VERIFYINGKEY: Groth16Verifyingkey =  Groth16Verifyingkey {
	nr_pubinputs: 18,

	vk_alpha_g1: [
		45,77,154,167,227,2,217,223,65,116,157,85,7,148,157,5,219,234,51,251,177,108,100,59,34,245,153,162,190,109,242,226,
		20,190,221,80,60,55,206,176,97,216,236,96,32,159,227,69,206,137,131,10,25,35,3,1,240,118,202,255,0,77,25,38,
	],

	vk_beta_g2: [
		9,103,3,47,203,247,118,209,175,201,133,248,136,119,241,130,211,132,128,166,83,242,222,202,169,121,76,188,59,243,6,12,
		14,24,120,71,173,76,121,131,116,208,214,115,43,245,1,132,125,214,139,192,224,113,36,30,2,19,188,127,193,61,183,171,
		48,76,251,209,224,138,112,74,153,245,232,71,217,63,140,60,170,253,222,196,107,122,13,55,157,166,154,77,17,35,70,167,
		23,57,193,177,164,87,168,199,49,49,35,210,77,47,145,146,248,150,183,198,62,234,5,169,213,127,6,84,122,208,206,200,
	],

	vk_gamme_g2: [
		25,142,147,147,146,13,72,58,114,96,191,183,49,251,93,37,241,170,73,51,53,169,231,18,151,228,133,183,174,243,18,194,
		24,0,222,239,18,31,30,118,66,106,0,102,94,92,68,121,103,67,34,212,247,94,218,221,70,222,189,92,217,146,246,237,
		9,6,137,208,88,95,240,117,236,158,153,173,105,12,51,149,188,75,49,51,112,179,142,243,85,172,218,220,209,34,151,91,
		18,200,94,165,219,140,109,235,74,171,113,128,141,203,64,143,227,209,231,105,12,67,211,123,76,230,204,1,102,250,125,170,
	],

	vk_delta_g2: [
		11,5,71,43,239,53,105,112,81,0,193,34,112,127,97,179,215,121,196,247,170,170,5,139,64,152,51,63,73,221,207,28,
		32,39,120,232,3,106,111,67,227,49,76,187,120,34,10,126,86,1,41,139,80,205,84,32,188,123,139,7,230,119,155,188,
		32,84,160,249,132,77,57,157,139,96,118,10,205,131,14,122,204,109,31,69,40,114,52,209,49,198,89,48,90,142,85,10,
		8,244,30,152,245,86,206,125,34,209,229,192,239,200,206,212,190,140,10,84,103,159,125,214,94,82,109,51,79,98,94,69,
	],

	vk_ic: &[
		[
			23,198,68,197,114,25,97,8,212,78,90,202,89,227,165,178,46,207,107,214,145,168,55,47,97,71,74,74,175,108,165,164,
			0,162,25,202,186,102,182,103,132,15,99,192,232,28,193,66,205,19,158,195,249,102,14,204,0,26,243,70,202,165,48,133,
		],
		[
			2,55,119,82,210,145,178,209,104,146,133,137,154,115,8,9,21,60,89,59,113,116,214,196,37,46,120,112,170,176,201,206,
			29,69,71,125,159,14,236,180,219,169,119,112,29,124,168,81,244,127,202,120,160,50,243,172,38,255,40,192,29,64,155,81,
		],
		[
			40,212,131,150,203,1,141,214,2,11,150,226,129,109,84,64,188,190,71,44,215,115,35,198,154,90,166,217,220,61,191,168,
			47,34,87,145,241,108,95,33,45,247,184,63,88,173,247,43,169,3,128,43,5,96,104,72,130,66,4,16,79,242,155,226,
		],
		[
			42,43,71,123,159,195,121,111,72,116,217,105,15,133,107,41,218,9,40,52,181,26,127,78,197,218,252,156,168,216,105,38,
			0,253,136,101,78,255,188,4,109,175,194,39,75,121,81,165,34,247,2,134,178,229,118,150,182,209,111,92,219,161,115,221,
		],
		[
			6,179,96,45,68,58,148,21,122,16,51,116,14,50,113,136,1,209,37,190,57,43,242,105,230,157,16,21,25,253,15,119,
			31,171,187,155,226,172,162,220,251,238,128,58,177,43,13,97,206,101,211,49,190,8,176,146,229,132,135,57,30,164,26,26,
		],
		[
			17,97,121,129,213,2,128,33,251,42,112,25,119,166,224,144,62,21,201,95,79,23,187,253,156,130,211,124,126,253,32,99,
			32,141,238,255,191,2,33,41,154,187,136,9,14,13,217,33,27,248,1,196,231,10,198,133,224,142,72,98,233,94,51,184,
		],
		[
			31,79,148,72,220,77,197,108,111,232,225,183,7,213,239,160,181,201,197,81,69,154,2,166,177,38,0,214,126,54,237,42,
			8,155,183,23,22,50,176,229,198,22,47,248,103,98,22,129,155,241,50,198,40,13,188,126,223,223,41,140,236,132,208,99,
		],
		[
			7,221,160,181,134,158,112,3,94,158,135,208,194,144,86,255,231,159,69,179,106,81,207,145,141,167,170,250,251,140,157,162,
			31,99,218,24,186,73,19,226,42,84,150,71,213,108,24,128,120,107,175,216,181,28,125,153,27,13,187,201,56,84,32,84,
		],
		[
			19,74,116,7,201,150,203,109,132,169,86,109,36,157,30,15,68,245,234,174,0,230,96,27,249,111,6,63,59,215,190,162,
			19,181,165,180,16,63,72,192,182,79,208,253,6,253,48,228,170,225,207,133,1,60,49,134,34,132,36,11,67,236,184,59,
		],
		[
			35,83,151,56,102,55,5,134,120,177,37,197,123,238,138,56,78,70,65,210,211,238,231,172,254,161,113,249,190,52,234,44,
			13,59,43,190,123,13,215,158,184,62,123,149,87,69,155,21,182,43,148,27,136,210,86,40,7,186,251,49,176,154,88,249,
		],
		[
			44,241,33,104,13,253,214,121,90,201,173,8,19,189,227,244,129,184,138,225,97,3,250,2,174,233,45,142,62,167,239,74,
			40,55,79,177,118,107,103,52,161,231,7,72,140,9,232,41,117,17,50,136,27,136,109,137,132,71,234,121,37,125,107,77,
		],
		[
			2,10,1,149,159,184,125,213,107,159,26,28,48,222,24,101,0,106,190,110,250,9,239,203,32,101,89,129,202,54,40,196,
			44,74,241,32,64,153,108,31,219,155,141,161,149,162,43,25,83,243,130,135,242,33,158,42,36,131,219,37,165,251,91,244,
		],
		[
			47,42,116,16,7,196,171,201,120,37,231,119,159,242,172,12,222,27,43,50,241,191,165,58,59,129,191,54,173,85,83,172,
			32,156,159,77,9,173,167,145,40,205,157,159,107,52,207,105,209,201,47,25,251,197,16,183,40,197,235,126,104,35,20,243,
		],
		[
			9,216,251,225,58,155,101,121,13,15,200,249,156,249,192,28,250,243,126,182,77,158,41,32,169,154,239,229,124,97,73,94,
			20,21,80,126,28,176,64,2,204,156,121,122,40,51,22,104,3,147,229,124,115,117,247,4,212,140,13,72,11,103,81,67,
		],
		[
			26,169,224,113,64,24,37,168,59,206,146,215,54,87,0,125,16,212,18,84,216,61,219,168,48,252,200,173,101,144,172,194,
			26,197,236,14,237,94,146,130,53,88,68,199,191,220,51,234,180,84,235,105,246,131,153,130,100,217,240,191,56,142,99,248,
		],
		[
			37,70,11,136,172,237,37,35,41,166,81,6,198,247,98,213,174,4,27,203,208,74,117,21,132,71,38,123,245,83,64,187,
			30,213,143,214,192,42,180,223,124,182,69,142,79,164,32,99,34,125,221,170,46,109,84,252,31,182,135,20,45,219,84,89,
		],
		[
			38,186,215,52,49,74,148,254,99,68,17,176,63,32,220,118,21,246,203,177,128,10,167,149,90,151,212,236,164,107,161,103,
			5,17,243,191,211,133,48,81,174,255,126,31,135,178,71,135,57,16,124,10,185,63,6,31,103,151,43,200,197,196,150,10,
		],
		[
			27,220,189,162,21,108,211,186,230,231,149,194,225,138,198,206,112,178,56,40,73,91,50,144,155,45,49,182,120,202,178,133,
			32,49,138,73,166,128,42,153,36,36,213,155,128,77,129,110,177,86,51,76,140,250,179,16,54,50,201,108,176,80,117,78,
		],
	]
};