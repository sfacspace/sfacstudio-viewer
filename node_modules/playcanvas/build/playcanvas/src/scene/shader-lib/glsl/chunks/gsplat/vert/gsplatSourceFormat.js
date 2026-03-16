var gsplatSourceFormatVS = `
#if defined(GSPLAT_WORKBUFFER_DATA)
	#include "gsplatWorkBufferVS"
#elif GSPLAT_COMPRESSED_DATA == true
	#include "gsplatCompressedDataVS"
	#if SH_COEFFS > 0
		#include "gsplatCompressedSHVS"
	#endif
#elif GSPLAT_SOGS_DATA == true
	#include "gsplatSogsDataVS"
	#include "gsplatSogsColorVS"
	#if SH_COEFFS > 0
		#include "gsplatSogsSHVS"
	#endif
#else
	#include "gsplatDataVS"
	#include "gsplatColorVS"
	#if SH_COEFFS > 0
		#include "gsplatSHVS"
	#endif
#endif
`;

export { gsplatSourceFormatVS as default };
