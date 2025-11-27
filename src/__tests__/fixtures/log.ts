export const muteLog = () => {
  const log = vi.spyOn(console, 'log');

  beforeAll(() => {
    log.mockImplementation(() => {});
  });

  afterAll(() => {
    log.mockRestore();
  });
};
