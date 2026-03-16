var particleUpdaterEndPS = /* wgsl */ `
    output.color = getOutput();
    return output;
}
`;

export { particleUpdaterEndPS as default };
