# CI/CD Setup Instructions

## Quick Start

Follow these steps to set up the CI/CD pipeline for your HealthyMeal project:

### 1. Enable GitHub Actions

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Click "Enable Actions" if not already enabled
4. GitHub will automatically detect the workflow files in `.github/workflows/`

### 2. Configure Repository Secrets

Navigate to your repository settings and add the following secrets:

#### Required Secrets

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Application URLs
BASE_URL=https://your-app.vercel.app
STAGING_BASE_URL=https://your-staging-app.vercel.app
```

#### Optional Secrets (for deployment)

```bash
# Vercel Deployment
VERCEL_TOKEN=your-vercel-token-here

# Netlify Deployment
NETLIFY_TOKEN=your-netlify-token-here

# DigitalOcean Deployment
DIGITALOCEAN_ACCESS_TOKEN=your-do-token-here

# Custom Server Deployment
STAGING_USER=deploy
STAGING_HOST=staging.yourdomain.com
STAGING_PATH=/var/www/staging
PRODUCTION_USER=deploy
PRODUCTION_HOST=yourdomain.com
PRODUCTION_PATH=/var/www/production
```

### 3. Configure Branch Protection

Set up branch protection rules for `main` and `develop` branches:

#### Main Branch Protection
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Require pull request reviews before merging (2 reviewers)
   - Dismiss stale PR reviews when new commits are pushed
   - Restrict pushes that create files that use the git push --force-with-lease command

#### Develop Branch Protection
1. Add rule for `develop` branch
2. Enable:
   - Require status checks to pass before merging
   - Require pull request reviews before merging (1 reviewer)
   - Dismiss stale PR reviews when new commits are pushed

### 4. Set Up Environments

Create environments for staging and production:

#### Staging Environment
1. Go to Settings → Environments
2. Click "New environment"
3. Name: `staging`
4. Add protection rules:
   - Required reviewers: 1
   - Wait timer: 0 minutes
   - Deployment branches: `develop`, `staging`

#### Production Environment
1. Create new environment
2. Name: `production`
3. Add protection rules:
   - Required reviewers: 2
   - Wait timer: 5 minutes
   - Deployment branches: `main`, `master`

### 5. Configure Status Checks

Ensure the following status checks are required:

#### For Main Branch
- `quality`
- `unit-tests`
- `e2e-tests`
- `build`

#### For Develop Branch
- `build-staging`
- `e2e-staging`

## Workflow Configuration

### Main Pipeline (`main.yml`)

This workflow runs on every push to `main` or `master`:

```yaml
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:
```

**Jobs**:
1. **quality** - Code quality checks
2. **unit-tests** - Unit testing with coverage
3. **e2e-tests** - End-to-end testing
4. **build** - Application build
5. **docker** - Docker image build
6. **performance** - Performance auditing
7. **deploy** - Production deployment
8. **status** - Pipeline summary

### Pull Request Checks (`pull-request.yml`)

This workflow runs on every PR and push to main:

```yaml
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
```

**Jobs**:
1. **lint** - Code linting
2. **unit-tests** - Unit testing
3. **e2E-tests** - End-to-end testing
4. **status-comment** - PR status comment

### Security Workflow (`security.yml`)

Runs weekly and on PRs:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
```

### Performance Workflow (`performance.yml`)

Runs weekly and on PRs:

```yaml
on:
  schedule:
    - cron: '0 6 * * 0'  # Every Sunday at 6 AM UTC
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
```

### Dependencies Workflow (`dependencies.yml`)

Runs weekly:

```yaml
on:
  schedule:
    - cron: '0 8 * * 2'  # Every Tuesday at 8 AM UTC
  workflow_dispatch:
```

### Staging Workflow (`staging.yml`)

Runs on develop/staging branches:

```yaml
on:
  push:
    branches: [ develop, staging ]
  pull_request:
    branches: [ develop, staging ]
  workflow_dispatch:
```

## Customization

### Modify Workflow Triggers

To change when workflows run, edit the `on` section:

```yaml
# Run only on specific branches
on:
  push:
    branches: [ main, develop, feature/* ]

# Run on specific file changes
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'

# Run on schedule
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

### Add Custom Jobs

To add custom jobs to a workflow:

```yaml
jobs:
  # ... existing jobs ...
  
  custom-job:
    name: Custom Job
    runs-on: ubuntu-latest
    needs: [previous-job]
    steps:
      - name: Checkout code
        uses: actions/checkout@v5
      
      - name: Custom step
        run: echo "Custom action"
```

### Modify Environment Variables

To change environment variables:

```yaml
env:
  NODE_VERSION: '18.17.0'  # Change Node.js version
  CUSTOM_VAR: 'custom-value'
```

## Testing Locally

### Using Act

Test workflows locally with [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Test a specific workflow
act -W .github/workflows/main.yml

# Test with specific event
act push -W .github/workflows/main.yml

# Test with secrets
act push -W .github/workflows/main.yml --secret-file .secrets
```

### Create .secrets file

```bash
# .secrets
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
```

## Troubleshooting

### Common Issues

#### Workflow Not Running

1. **Check file location**: Ensure workflow files are in `.github/workflows/`
2. **Check syntax**: Validate YAML syntax
3. **Check permissions**: Ensure GitHub Actions is enabled
4. **Check branch**: Ensure workflow triggers match your branch names

#### Secrets Not Available

1. **Check secret names**: Ensure exact match (case-sensitive)
2. **Check repository**: Secrets are repository-specific
3. **Check permissions**: Ensure workflow has access to secrets

#### Tests Failing in CI

1. **Check Node.js version**: Ensure compatibility
2. **Check dependencies**: Verify package.json and lock file
3. **Check environment**: Ensure all required env vars are set
4. **Check platform**: Some packages may behave differently in CI

#### Deployment Fails

1. **Check tokens**: Verify deployment tokens are valid
2. **Check permissions**: Ensure tokens have deployment rights
3. **Check environment**: Verify target environment is accessible
4. **Check logs**: Review deployment logs for specific errors

### Debug Mode

Enable debug logging:

```bash
# Set secret in repository
ACTIONS_STEP_DEBUG=true

# Or set in workflow
env:
  ACTIONS_STEP_DEBUG: true
```

### Workflow Logs

1. Go to Actions tab
2. Click on failed workflow
3. Click on failed job
4. Click on failed step
5. Review logs for error details

## Best Practices

### Security

1. **Never commit secrets**: Use repository secrets only
2. **Limit permissions**: Use minimal required permissions
3. **Regular audits**: Run security scans regularly
4. **Dependency updates**: Keep dependencies updated

### Performance

1. **Cache dependencies**: Use GitHub's cache action
2. **Parallel jobs**: Run independent jobs in parallel
3. **Optimize builds**: Minimize build time
4. **Clean artifacts**: Set appropriate retention periods

### Reliability

1. **Fail fast**: Stop on first failure
2. **Retry logic**: Implement retry for flaky operations
3. **Rollback strategy**: Plan for deployment failures
4. **Monitoring**: Set up alerts for failures

### Maintenance

1. **Regular updates**: Keep actions updated
2. **Documentation**: Document customizations
3. **Testing**: Test changes before deployment
4. **Backup**: Keep backup of working configurations

## Next Steps

After setting up the CI/CD pipeline:

1. **Test the pipeline**: Push a small change to trigger workflows
2. **Monitor performance**: Check workflow execution times
3. **Set up notifications**: Configure alerts for failures
4. **Customize workflows**: Adapt to your specific needs
5. **Document changes**: Keep setup documentation updated

## Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review workflow logs for error details
3. Search existing issues and discussions
4. Create a new issue with detailed information

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [GitHub Actions Examples](https://github.com/actions/starter-workflows)
- [Act - Local GitHub Actions](https://github.com/nektos/act)
- [GitHub Actions Cheat Sheet](https://github.com/actions/cheat-sheet)
