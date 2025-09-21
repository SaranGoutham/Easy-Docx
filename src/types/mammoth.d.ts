declare module 'mammoth' {
  interface ExtractRawTextResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  function extractRawText(input: { path?: string; buffer?: Buffer }): Promise<ExtractRawTextResult>;

  export default {
    extractRawText,
  };
}
