/*!
 * Copyright (c) 2026-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { VideoCodec } from './codec.js';
import { PacketType } from './packet.js';
import { MetadataTags } from './metadata.js';
export declare enum AvcNalUnitType {
    NON_IDR_SLICE = 1,
    SLICE_DPA = 2,
    SLICE_DPB = 3,
    SLICE_DPC = 4,
    IDR = 5,
    SEI = 6,
    SPS = 7,
    PPS = 8,
    AUD = 9,
    SPS_EXT = 13
}
export declare enum HevcNalUnitType {
    RASL_N = 8,
    RASL_R = 9,
    BLA_W_LP = 16,
    RSV_IRAP_VCL23 = 23,
    VPS_NUT = 32,
    SPS_NUT = 33,
    PPS_NUT = 34,
    AUD_NUT = 35,
    PREFIX_SEI_NUT = 39,
    SUFFIX_SEI_NUT = 40
}
export type NalUnitLocation = {
    offset: number;
    length: number;
};
export declare const iterateNalUnitsInAnnexB: (packetData: Uint8Array) => Generator<NalUnitLocation>;
export declare const iterateNalUnitsInLengthPrefixed: (packetData: Uint8Array, lengthSize: 1 | 2 | 3 | 4) => Generator<NalUnitLocation>;
export declare const iterateAvcNalUnits: (packetData: Uint8Array, decoderConfig: VideoDecoderConfig) => Generator<NalUnitLocation, any, any>;
export declare const extractNalUnitTypeForAvc: (byte: number) => number;
export declare const concatNalUnitsInAnnexB: (nalUnits: Uint8Array[]) => Uint8Array<ArrayBuffer>;
export declare const concatNalUnitsInLengthPrefixed: (nalUnits: Uint8Array[], lengthSize: 1 | 2 | 3 | 4) => Uint8Array<ArrayBuffer>;
export type AvcDecoderConfigurationRecord = {
    configurationVersion: number;
    avcProfileIndication: number;
    profileCompatibility: number;
    avcLevelIndication: number;
    lengthSizeMinusOne: number;
    sequenceParameterSets: Uint8Array[];
    pictureParameterSets: Uint8Array[];
    chromaFormat: number | null;
    bitDepthLumaMinus8: number | null;
    bitDepthChromaMinus8: number | null;
    sequenceParameterSetExt: Uint8Array[] | null;
};
export declare const concatAvcNalUnits: (nalUnits: Uint8Array[], decoderConfig: VideoDecoderConfig) => Uint8Array<ArrayBuffer>;
/** Builds an AvcDecoderConfigurationRecord from an AVC packet in Annex B format. */
export declare const extractAvcDecoderConfigurationRecord: (packetData: Uint8Array) => AvcDecoderConfigurationRecord | null;
/** Serializes an AvcDecoderConfigurationRecord into the format specified in Section 5.3.3.1 of ISO 14496-15. */
export declare const serializeAvcDecoderConfigurationRecord: (record: AvcDecoderConfigurationRecord) => Uint8Array<ArrayBuffer>;
/** Deserializes an AvcDecoderConfigurationRecord from the format specified in Section 5.3.3.1 of ISO 14496-15. */
export declare const deserializeAvcDecoderConfigurationRecord: (data: Uint8Array) => AvcDecoderConfigurationRecord | null;
export type AvcSpsInfo = {
    profileIdc: number;
    constraintFlags: number;
    levelIdc: number;
    frameMbsOnlyFlag: number;
    chromaFormatIdc: number;
    bitDepthLumaMinus8: number;
    bitDepthChromaMinus8: number;
    codedWidth: number;
    codedHeight: number;
    displayWidth: number;
    displayHeight: number;
    colourPrimaries: number;
    transferCharacteristics: number;
    matrixCoefficients: number;
    fullRangeFlag: number;
    numReorderFrames: number;
    maxDecFrameBuffering: number;
};
/** Parses an AVC SPS (Sequence Parameter Set) to extract basic information. */
export declare const parseAvcSps: (sps: Uint8Array) => AvcSpsInfo | null;
export type HevcDecoderConfigurationRecord = {
    configurationVersion: number;
    generalProfileSpace: number;
    generalTierFlag: number;
    generalProfileIdc: number;
    generalProfileCompatibilityFlags: number;
    generalConstraintIndicatorFlags: Uint8Array;
    generalLevelIdc: number;
    minSpatialSegmentationIdc: number;
    parallelismType: number;
    chromaFormatIdc: number;
    bitDepthLumaMinus8: number;
    bitDepthChromaMinus8: number;
    avgFrameRate: number;
    constantFrameRate: number;
    numTemporalLayers: number;
    temporalIdNested: number;
    lengthSizeMinusOne: number;
    arrays: {
        arrayCompleteness: number;
        nalUnitType: number;
        nalUnits: Uint8Array[];
    }[];
};
export type HevcSpsInfo = {
    displayWidth: number;
    displayHeight: number;
    colourPrimaries: number;
    transferCharacteristics: number;
    matrixCoefficients: number;
    fullRangeFlag: number;
    maxDecFrameBuffering: number;
    spsMaxSubLayersMinus1: number;
    spsTemporalIdNestingFlag: number;
    generalProfileSpace: number;
    generalTierFlag: number;
    generalProfileIdc: number;
    generalProfileCompatibilityFlags: number;
    generalConstraintIndicatorFlags: Uint8Array;
    generalLevelIdc: number;
    chromaFormatIdc: number;
    bitDepthLumaMinus8: number;
    bitDepthChromaMinus8: number;
    minSpatialSegmentationIdc: number;
};
export declare const iterateHevcNalUnits: (packetData: Uint8Array, decoderConfig: VideoDecoderConfig) => Generator<NalUnitLocation, any, any>;
export declare const extractNalUnitTypeForHevc: (byte: number) => number;
/** Parses an HEVC SPS (Sequence Parameter Set) to extract video information. */
export declare const parseHevcSps: (sps: Uint8Array) => HevcSpsInfo | null;
/** Builds a HevcDecoderConfigurationRecord from an HEVC packet in Annex B format. */
export declare const extractHevcDecoderConfigurationRecord: (packetData: Uint8Array) => HevcDecoderConfigurationRecord | null;
/** Serializes an HevcDecoderConfigurationRecord into the format specified in Section 8.3.3.1 of ISO 14496-15. */
export declare const serializeHevcDecoderConfigurationRecord: (record: HevcDecoderConfigurationRecord) => Uint8Array<ArrayBuffer>;
/** Deserializes an HevcDecoderConfigurationRecord from the format specified in Section 8.3.3.1 of ISO 14496-15. */
export declare const deserializeHevcDecoderConfigurationRecord: (data: Uint8Array) => HevcDecoderConfigurationRecord | null;
export type Vp9CodecInfo = {
    profile: number;
    level: number;
    bitDepth: number;
    chromaSubsampling: number;
    videoFullRangeFlag: number;
    colourPrimaries: number;
    transferCharacteristics: number;
    matrixCoefficients: number;
};
export declare const extractVp9CodecInfoFromPacket: (packet: Uint8Array) => Vp9CodecInfo | null;
export type Av1CodecInfo = {
    profile: number;
    level: number;
    tier: number;
    bitDepth: number;
    monochrome: number;
    chromaSubsamplingX: number;
    chromaSubsamplingY: number;
    chromaSamplePosition: number;
};
/** Iterates over all OBUs in an AV1 packet bistream. */
export declare const iterateAv1PacketObus: (packet: Uint8Array) => Generator<{
    type: number;
    data: Uint8Array<ArrayBufferLike>;
}, void, unknown>;
/**
 * When AV1 codec information is not provided by the container, we can still try to extract the information by digging
 * into the AV1 bitstream.
 */
export declare const extractAv1CodecInfoFromPacket: (packet: Uint8Array) => Av1CodecInfo | null;
export declare const parseOpusIdentificationHeader: (bytes: Uint8Array) => {
    outputChannelCount: number;
    preSkip: number;
    inputSampleRate: number;
    outputGain: number;
    channelMappingFamily: number;
    channelMappingTable: Uint8Array<ArrayBufferLike> | null;
};
export declare const parseOpusTocByte: (packet: Uint8Array) => {
    durationInSamples: number;
};
export declare const parseModesFromVorbisSetupPacket: (setupHeader: Uint8Array) => {
    modeBlockflags: number[];
};
/** Determines a packet's type (key or delta) by digging into the packet bitstream. */
export declare const determineVideoPacketType: (codec: VideoCodec, decoderConfig: VideoDecoderConfig, packetData: Uint8Array) => PacketType | null;
export declare enum FlacBlockType {
    STREAMINFO = 0,
    VORBIS_COMMENT = 4,
    PICTURE = 6
}
export declare const readVorbisComments: (bytes: Uint8Array, metadataTags: MetadataTags) => void;
export declare const createVorbisComments: (headerBytes: Uint8Array, tags: MetadataTags, writeImages: boolean) => Uint8Array<ArrayBuffer>;
//# sourceMappingURL=codec-data.d.ts.map