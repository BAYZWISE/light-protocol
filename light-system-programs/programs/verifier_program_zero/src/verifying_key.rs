use groth16_solana::groth16::Groth16Verifyingkey;

pub const VERIFYINGKEY: Groth16Verifyingkey =  Groth16Verifyingkey {
	nr_pubinputs: 10,

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
		25,142,147,147,146,13,72,58,114,96,191,183,49,251,93,37,241,170,73,51,53,169,231,18,151,228,133,183,174,243,18,194,
		24,0,222,239,18,31,30,118,66,106,0,102,94,92,68,121,103,67,34,212,247,94,218,221,70,222,189,92,217,146,246,237,
		9,6,137,208,88,95,240,117,236,158,153,173,105,12,51,149,188,75,49,51,112,179,142,243,85,172,218,220,209,34,151,91,
		18,200,94,165,219,140,109,235,74,171,113,128,141,203,64,143,227,209,231,105,12,67,211,123,76,230,204,1,102,250,125,170,
	],

	vk_ic: &[
		[
			10,32,224,51,29,86,116,93,40,21,215,199,109,65,40,248,169,231,235,104,81,69,106,143,53,138,147,98,4,195,139,193,
			44,87,12,9,76,181,215,58,31,210,137,47,250,132,237,218,84,213,106,27,75,210,227,238,109,127,206,166,44,173,159,218,
		],
		[
			14,194,148,5,192,240,196,184,183,169,108,203,1,178,70,115,209,173,154,178,163,180,103,116,28,87,46,1,80,216,98,48,
			45,62,80,187,14,15,8,200,156,9,85,172,31,203,10,198,102,253,126,221,246,95,6,72,128,39,66,135,25,80,247,110,
		],
		[
			3,27,36,104,25,162,2,204,173,221,186,217,130,89,110,83,150,32,187,161,24,201,227,51,57,254,179,231,255,16,95,53,
			26,219,219,185,43,123,8,125,65,24,27,125,176,125,244,171,96,112,17,116,231,213,57,90,243,64,160,171,17,85,253,36,
		],
		[
			5,205,199,85,37,74,207,65,114,171,218,123,130,7,205,88,247,173,76,226,116,132,84,137,134,24,17,39,134,147,241,196,
			32,6,208,233,121,252,13,249,106,232,86,8,208,166,73,49,174,128,186,123,148,233,30,82,38,163,197,0,37,248,32,9,
		],
		[
			22,198,102,214,56,237,28,72,217,139,49,109,11,151,189,99,180,69,210,66,10,92,209,217,209,41,213,170,183,190,115,148,
			17,203,177,245,33,121,85,175,21,9,223,25,83,72,69,78,148,9,55,223,136,199,144,76,35,225,229,62,19,220,5,106,
		],
		[
			30,186,140,157,222,181,73,231,187,104,47,185,157,70,44,144,97,34,15,57,242,127,129,60,66,236,244,91,157,47,113,118,
			1,16,75,217,84,38,24,236,234,154,219,77,47,63,222,61,116,178,175,229,206,98,239,127,3,134,209,147,24,165,70,135,
		],
		[
			35,75,138,181,148,165,157,78,72,110,79,246,97,53,159,146,67,49,169,86,22,100,102,233,88,255,187,192,166,24,166,224,
			29,165,138,55,69,169,17,101,7,101,113,212,245,114,86,206,30,85,152,38,173,59,144,98,59,180,130,21,215,54,51,172,
		],
		[
			16,152,60,218,87,90,32,55,197,75,35,75,49,5,106,119,65,181,38,184,254,64,90,226,30,13,12,121,243,152,148,215,
			18,116,243,164,33,94,171,59,207,240,233,200,175,20,168,0,182,116,90,196,197,144,71,151,27,210,2,86,206,44,64,25,
		],
		[
			22,211,126,224,228,185,164,106,92,62,142,202,186,147,44,130,153,120,98,69,22,164,244,180,206,99,102,228,237,1,26,249,
			16,197,207,28,244,119,100,2,52,141,133,118,85,251,224,10,61,210,59,174,150,62,3,199,141,180,200,158,132,191,137,3,
		],
		[
			47,176,172,39,158,126,194,195,237,158,210,27,50,173,243,148,89,55,150,250,236,234,35,161,182,122,209,106,44,232,244,28,
			14,126,245,10,194,216,200,169,12,174,1,39,119,83,117,216,105,106,234,76,80,63,145,209,72,28,99,59,100,110,75,245,
		],
	]
};