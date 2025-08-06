# GitHub Workflows

This directory contains GitHub Actions workflows for building and releasing the Electron application.

## Available Workflows

### 1. build-windows.yml
Builds and releases only the Windows version of the application.

**Triggers:**
- Push tags starting with `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**Features:**
- Builds on Windows runner
- Creates Windows installer (.exe, .msi)
- Uploads artifacts for 30 days
- Creates GitHub release automatically

### 2. build-all-platforms.yml
Builds and releases for all platforms (Windows, macOS, Linux).

**Triggers:**
- Push tags starting with `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch with platform selection

**Features:**
- Parallel builds for all platforms
- Platform-specific installers
- Combined release with all platform artifacts
- Manual trigger allows platform selection

## Usage

### Automatic Release (Recommended)
1. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. The workflow will automatically trigger and create a release

### Manual Release
1. Go to GitHub Actions tab
2. Select the desired workflow
3. Click "Run workflow"
4. Enter the version number (e.g., `1.0.0`)
5. For multi-platform workflow, specify platforms (optional)

## Configuration

### Electron Builder Configuration
The build process uses `electron-builder.json5` for configuration:
- Windows: NSIS installer (.exe)
- macOS: DMG installer
- Linux: AppImage, DEB, RPM packages

### No Code Signing
These workflows are configured without code signing for simplicity. For production releases, consider adding code signing certificates.

## Artifacts
- **Windows**: `.exe`, `.msi`, `.zip` files
- **macOS**: `.dmg`, `.zip` files  
- **Linux**: `.AppImage`, `.deb`, `.rpm`, `.zip` files

All artifacts are uploaded to GitHub Actions and attached to releases. 