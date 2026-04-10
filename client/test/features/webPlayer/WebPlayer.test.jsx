import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WebPlayer from '../../../src/features/webPlayer/WebPlayer';

describe('WebPlayer', () => {
	const mockPlayer = {
		togglePlay: vi.fn(),
		previousTrack: vi.fn(),
		nextTrack: vi.fn(),
	};

	const currentTrack = {
		name: 'Test Track',
		artists: [{ name: 'Test Artist' }],
		album: { images: [{ url: 'test-image.jpg' }] },
	};

	const activeProps = {
		player: mockPlayer,
		is_paused: false,
		is_active: true,
		current_track: currentTrack,
		volume: 0.5,
		onVolumeChange: vi.fn(),
		onMuteToggle: vi.fn(),
		repeatMode: 0,
		onRepeatChange: vi.fn(),
		position: 30000,
		duration: 210000,
		onSeek: vi.fn(),
	};

	beforeEach(() => {
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe() {}
				disconnect() {}
			}
		);
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('renders the inactive message when the player is not active', () => {
		render(<WebPlayer {...activeProps} is_active={false} />);

		expect(screen.getByText(/transfer playback to/i)).toBeInTheDocument();
		expect(screen.getByText(/jammming web player/i)).toBeInTheDocument();
	});

	test('does not render playback controls when the player is not active', () => {
		render(<WebPlayer {...activeProps} is_active={false} />);

		expect(screen.queryByRole('button', { name: /previous track/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('slider')).not.toBeInTheDocument();
	});

	test('renders the track name, artist, and album cover when active', () => {
		render(<WebPlayer {...activeProps} />);

		expect(screen.getByText('Test Track')).toBeInTheDocument();
		expect(screen.getByText('Test Artist')).toBeInTheDocument();
		expect(screen.getByAltText('Test Track album cover')).toHaveAttribute('src', 'test-image.jpg');
	});

	test('shows a Pause button when playing and a Play button when paused', () => {
		const { rerender } = render(<WebPlayer {...activeProps} is_paused={false} />);
		expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

		rerender(<WebPlayer {...activeProps} is_paused={true} />);
		expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
	});

	test('clicking Previous track calls player.previousTrack', () => {
		render(<WebPlayer {...activeProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Previous track' }));
		expect(mockPlayer.previousTrack).toHaveBeenCalledTimes(1);
	});

	test('clicking Play/Pause calls player.togglePlay', () => {
		render(<WebPlayer {...activeProps} is_paused={false} />);
		fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
		expect(mockPlayer.togglePlay).toHaveBeenCalledTimes(1);
	});

	test('clicking Next track calls player.nextTrack', () => {
		render(<WebPlayer {...activeProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Next track' }));
		expect(mockPlayer.nextTrack).toHaveBeenCalledTimes(1);
	});

	test('repeat button shows the correct aria-label for each repeat mode', () => {
		const { rerender } = render(<WebPlayer {...activeProps} repeatMode={0} />);
		expect(screen.getByRole('button', { name: 'Repeat off' })).toBeInTheDocument();

		rerender(<WebPlayer {...activeProps} repeatMode={1} />);
		expect(screen.getByRole('button', { name: 'Repeat all' })).toBeInTheDocument();

		rerender(<WebPlayer {...activeProps} repeatMode={2} />);
		expect(screen.getByRole('button', { name: 'Repeat track' })).toBeInTheDocument();
	});

	test('clicking the repeat button calls onRepeatChange', () => {
		const onRepeatChange = vi.fn();
		render(<WebPlayer {...activeProps} onRepeatChange={onRepeatChange} />);
		fireEvent.click(screen.getByRole('button', { name: 'Repeat off' }));
		expect(onRepeatChange).toHaveBeenCalledTimes(1);
	});

	test('volume slider renders with the correct value and calls onVolumeChange on change', () => {
		const onVolumeChange = vi.fn();
		render(<WebPlayer {...activeProps} volume={0.75} onVolumeChange={onVolumeChange} />);

		const volumeSlider = screen.getByRole('slider', { name: 'Volume' });
		expect(volumeSlider).toHaveValue('0.75');

		fireEvent.change(volumeSlider, { target: { value: '0.4' } });
		expect(onVolumeChange).toHaveBeenCalledWith(0.4);
	});

	test('mute button calls onMuteToggle when clicked', () => {
		const onMuteToggle = vi.fn();
		render(<WebPlayer {...activeProps} volume={0.6} onMuteToggle={onMuteToggle} />);
		fireEvent.click(screen.getByRole('button', { name: 'Mute' }));
		expect(onMuteToggle).toHaveBeenCalledTimes(1);
	});

	test('unmute button calls onMuteToggle when volume is 0', () => {
		const onMuteToggle = vi.fn();
		render(<WebPlayer {...activeProps} volume={0} onMuteToggle={onMuteToggle} />);
		fireEvent.click(screen.getByRole('button', { name: 'Unmute' }));
		expect(onMuteToggle).toHaveBeenCalledTimes(1);
	});

	test('displays the formatted position and duration times', () => {
		// position: 30000ms = 0:30, duration: 210000ms = 3:30
		render(<WebPlayer {...activeProps} position={30000} duration={210000} />);
		expect(screen.getByText('0:30')).toBeInTheDocument();
		expect(screen.getByText('3:30')).toBeInTheDocument();
	});

	test('seek slider calls onSeek with the correct numeric value on pointer up', () => {
		const onSeek = vi.fn();
		render(<WebPlayer {...activeProps} onSeek={onSeek} />);

		const seekSlider = screen.getByRole('slider', { name: 'Song position' });
		fireEvent.pointerUp(seekSlider, { target: { value: '60000' } });
		expect(onSeek).toHaveBeenCalledWith(60000);
	});
});
