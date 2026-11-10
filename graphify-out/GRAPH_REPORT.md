# Graph Report - lil.p  (2026-11-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 6098 nodes · 19560 edges · 227 communities (195 shown, 32 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 455 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d0d474b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 202
- Community 203
- Community 204
- Community 207
- Community 208
- Community 210
- Community 211
- Community 212
- Community 213
- Community 214
- Community 215
- Community 216
- Community 217
- Community 219
- Community 220
- Community 221
- Community 222
- Community 223

## God Nodes (most connected - your core abstractions)
1. `cn()` - 274 edges
2. `@nestjs/common` - 162 edges
3. `Button()` - 149 edges
4. `next-intl` - 138 edges
5. `Locale` - 125 edges
6. `next` - 102 edges
7. `apiClient()` - 88 edges
8. `PrismaService` - 80 edges
9. `Badge()` - 74 edges
10. `Input()` - 73 edges

## Surprising Connections (you probably didn't know these)
- `NotFound()` --calls--> `Button()`  [EXTRACTED]
  apps/web/app/[locale]/(site)/not-found.tsx → packages/ui/src/components/ui/button.tsx
- `Topbar()` --calls--> `BrandMark()`  [EXTRACTED]
  apps/web/src/modules/admin-core/components/Topbar/Topbar.tsx → packages/ui/src/components/BrandMark/BrandMark.tsx
- `Topbar()` --calls--> `Button()`  [EXTRACTED]
  apps/web/src/modules/admin-core/components/Topbar/Topbar.tsx → packages/ui/src/components/ui/button.tsx
- `BlockRow()` --calls--> `Icon()`  [EXTRACTED]
  apps/web/src/modules/admin-pages/components/BlockRow/BlockRow.tsx → packages/ui/src/components/Icon/Icon.tsx
- `BlockRow()` --calls--> `Button()`  [EXTRACTED]
  apps/web/src/modules/admin-pages/components/BlockRow/BlockRow.tsx → packages/ui/src/components/ui/button.tsx

## Import Cycles
- None detected.

## Communities (227 total, 32 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (86): NotFound(), useRouter, Topbar(), navItemFor(), logout(), switchAdminLocale(), CollectionMediaLibrary(), MediaLibraryItem (+78 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (94): AdminPostEditorPage(), AdminNewPostPage(), CardActions, EntityForm(), pickFields(), SmallEntityRow, SmallField, ExperienceForm() (+86 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (78): AdminExperienceEditorPage(), AdminNewExperiencePage(), useAdminExperienceRow(), useCreateAdminExperience(), useDeleteAdminExperience(), useSaveAdminExperience(), createAdminExperience(), getAdminExperience() (+70 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (67): AdminDomainsPage(), AdminEducationPage(), AdminPostsPage(), firstSearchParam(), AdminPrinciplesPage(), AdminProcessPage(), AdminSitePage(), AdminSkillsPage() (+59 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (57): assertFresh(), MockAuthenticationGuard, PageWithAllBlocks, pageWithAllBlocksInclude, PageWithBlocks, pageWithBlocksInclude, hasUnpublishedChanges(), toAdminBlock() (+49 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (65): AdminAuditPage(), AdminInboxPage(), LocaleError(), SiteError(), ExperienceTable(), item, labels, renderTable() (+57 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (33): contactTopicsData, navItemsData, profileData, siteSettingsData, socialLinksData, adminEmail, UsersService, PrismaService (+25 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (31): CurrentUser, JwtRefreshGuard, MUTATING, AuthController, AuthedRequest, ACCESS_COOKIE, ACCESS_COOKIE_PATH, authCookieFlags() (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (23): Public(), Roles(), flattenZodError(), ZodValidationPipe, Locale(), PublicContactController, PublicContactTopicsController, PublicDomainsController (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.03
Nodes (75): dependencies, argon2@^0.45.1, cloudinary@^2.11.0, cookie-parser@^1.4.7, dotenv@^18.0.9, multer@^2.5.0, @nestjs/common@^11.1.9, @nestjs/core@^11.1.9 (+67 more)

### Community 10 - "Community 10"
Cohesion: 0.04
Nodes (82): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/modifiers@^9.0.0, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2 (+74 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (33): paginate(), readingMinutes(), withAuditTx(), AdminPostsController, PostRow, postSelect, postTagSelect, toAdminDto() (+25 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (56): AdminMediaPage(), dynamic, EducationEntityIndex(), AdminBottomBar(), CONTENT_HREFS, keyboardOpen(), subscribeViewport(), within() (+48 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (41): AdapterCause, AllExceptionsFilter, RequestWithId, uniqueFieldFromPrisma(), applyReorder(), assertSameIds(), reorder(), ReorderDelegate (+33 more)

### Community 14 - "Community 14"
Cohesion: 0.05
Nodes (34): AdminExperienceController, toAdminDto(), ExperienceService, row, useMoveAdminExperience(), listAdminExperience(), queryString(), reorderAdminExperience() (+26 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (47): listPrinciples(), AboutIntroSkeleton(), BlockHeading(), CaseGridBlock(), CaseGridSkeleton(), ContactFormSkeleton(), CtaBandSkeleton(), CvDownloadBlock() (+39 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (44): getPathname, Link, redirect, usePathname, routing, SchemaForm(), renderForm(), RangeToggle() (+36 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (49): BlockDefinition, BlockRef, BlockRole, defineBlock(), aboutIntroBlock, aboutIntroPropsSchema, caseGridBlock, caseGridPropsSchema (+41 more)

### Community 18 - "Community 18"
Cohesion: 0.04
Nodes (26): LoggingInterceptor, RequestWithId, RequestIdMiddleware, AuditActorInterceptor, AuthModule, ContactModule, ContactTopicsModule, DomainsModule (+18 more)

### Community 19 - "Community 19"
Cohesion: 0.06
Nodes (35): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+27 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (51): adminViewsSchema, topPageSchema, topReferrerSchema, trackViewSchema, viewDeviceSchema, viewsByDaySchema, TopPage, TopReferrer (+43 more)

### Community 21 - "Community 21"
Cohesion: 0.08
Nodes (17): AdminProcessStepsController, ProcessStepRow, processStepSelect, toAdminDto(), toPublicProcessStep(), TRANSLATED, ProcessStepsModule, ProcessStepsService (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.06
Nodes (19): Box, CARDS, legacy, openPalette(), palette(), editors, primaryLink(), projectsTable() (+11 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (40): toIsoDate(), EnViKey, hasText(), pickGroup(), row, EducationRow, educationSelect, toAdminDto() (+32 more)

### Community 24 - "Community 24"
Cohesion: 0.07
Nodes (23): AdminContactController, ContactService, ContactMessageRow, parseLocale(), toAdminContactMessage(), adminContactMessageListPageSchema, adminContactMessageListParamsSchema, adminContactMessageSchema (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.04
Nodes (42): Default, meta, Story, Default, HiddenWhenEmpty, meta, Story, Idle (+34 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (34): POST(), generateMetadata, Page(), revalidate, dynamic, generateMetadata, Page(), generateMetadata (+26 more)

### Community 27 - "Community 27"
Cohesion: 0.06
Nodes (39): hastToReact(), heading(), isAllowedImageSrc(), isAllowedMarkdownUrl(), MARKDOWN_CODE_LANGUAGES, @tiptap/core@3.32.0, @tiptap/pm@3.32.0, @tiptap/react@3.32.0 (+31 more)

### Community 28 - "Community 28"
Cohesion: 0.08
Nodes (38): AdminCmsLayout(), AdminLiveEvents(), AdminShell(), AdminSidebar(), NAV_ICONS, AdminCommandPalette(), PaletteItem, SEQUENCES (+30 more)

### Community 29 - "Community 29"
Cohesion: 0.09
Nodes (25): AdminAnalyticsPage(), firstSearchParam(), AdminExperiencePage(), firstSearchParam(), AdminInboxDetailPage(), AdminPageEditorPage(), AdminPagesPage(), AdminUsersPage() (+17 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (26): folder, manifest, captureDir, captures, captures, copy, folder, newerCopy (+18 more)

### Community 31 - "Community 31"
Cohesion: 0.07
Nodes (33): useMediaUpload(), FakeXhr, uploadMedia(), UploadProgressHandler, CreatePageDialog(), keyMessage(), submit(), titleMessage() (+25 more)

### Community 32 - "Community 32"
Cohesion: 0.04
Nodes (12): @nestjs/config@^4.0.2, isSameOrigin(), OriginGuard, AppConfigService, ConfigModule, Env, envSchema, optionalSecret (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.05
Nodes (48): @portfolio/contracts@workspace:*, @portfolio/contracts, dependencies, github-slugger@^2.0.0, hast-util-to-jsx-runtime@^2.3.6, lucide-react@^0.553.0, next@16.4.3, next-intl@^4.14.9 (+40 more)

### Community 34 - "Community 34"
Cohesion: 0.05
Nodes (31): AdminProjectEditorPage(), AdminNewProjectPage(), missingKeys(), admin, create, update, user, admin (+23 more)

### Community 35 - "Community 35"
Cohesion: 0.06
Nodes (12): AdminAuditController, auditActor, AuditActorStore, currentAuditUserId(), AuditModule, AuditClient, AuditRecordInput, AuditService (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (18): ContactThrottleGuard, LoginThrottleGuard, RateLimitGuard, ViewsThrottleGuard, RequestWithId, hashIp(), requestIp(), utcDayKey() (+10 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (7): AdminSkillCategoriesController, AdminSkillsController, toAdminCategory(), toAdminSkill(), SkillsService, AdminSkill, AdminSkillCategory

### Community 38 - "Community 38"
Cohesion: 0.09
Nodes (11): AdminEducationController, EducationService, PublicEducationController, adminEducationSchema, educationCreateSchema, educationUpdateSchema, publicEducationSchema, AdminEducation (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.08
Nodes (37): contentType, generateStaticParams(), Image(), revalidate, size, generateMetadata, generateStaticParams(), Page() (+29 more)

### Community 40 - "Community 40"
Cohesion: 0.05
Nodes (40): @types/node@^22.19.1, @types/node, LighthouseScores, runMobileLighthouse(), pages, allowedStrings, devDependencies, @axe-core/playwright@^4.14.0 (+32 more)

### Community 41 - "Community 41"
Cohesion: 0.08
Nodes (35): BLOCK_SURFACES, LAYOUT_PRESETS, blockTypeSchema, adminBlockSchema, blockKeySchema, publicBlockSchema, BlockSurface, blockSurfaceSchema (+27 more)

### Community 42 - "Community 42"
Cohesion: 0.09
Nodes (31): AdminProjectsPage(), firstSearchParam(), SetParamsOptions, replace, useListParams(), DEFAULTS, paramsFromSearch(), searchFromParams() (+23 more)

### Community 43 - "Community 43"
Cohesion: 0.09
Nodes (10): slugify(), AdminTagsController, TagRow, tagSelect, toAdminDto(), toPublicTag(), TagsService, AdminTag (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.12
Nodes (38): mapContactTopics(), mapDomains(), mapEducation(), mapNavItems(), mapPrinciples(), mapProcessSteps(), mapProfileStats(), mapSiteSettings() (+30 more)

### Community 45 - "Community 45"
Cohesion: 0.05
Nodes (36): compilerOptions, declaration, emitDecoratorMetadata, experimentalDecorators, module, moduleResolution, noEmit, outDir (+28 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (23): NotesBrowser(), NotesBrowserContent(), formatDate(), PostList(), labels, renderEmpty(), TagFilter(), useNotesSearch() (+15 more)

### Community 47 - "Community 47"
Cohesion: 0.05
Nodes (37): react-dom@19.3.0, @testing-library/jest-dom@^6.9.1, react-dom, @testing-library/jest-dom, devDependencies, @fontsource/be-vietnam-pro@^5.2.8, @fontsource/jetbrains-mono@^5.2.8, @fontsource-variable/inter@^5.2.8 (+29 more)

### Community 48 - "Community 48"
Cohesion: 0.12
Nodes (30): ADMIN_TABLE_SEARCH_DEBOUNCE_MS, AdminTable(), renderBody(), statusRow(), AdminTableLinkProps, AdminTableSearch, AdminTableSearchField(), COLUMNS (+22 more)

### Community 49 - "Community 49"
Cohesion: 0.09
Nodes (26): main(), educationData, experienceData, principleData, processStepData, profileStatData, seedAbout(), seedAdmin() (+18 more)

### Community 50 - "Community 50"
Cohesion: 0.09
Nodes (28): hueSchema, adminDomainSchema, domainCreateSchema, domainUpdateSchema, publicDomainSchema, publicProjectDomainSchema, DomainCreateInput, DomainUpdateInput (+20 more)

### Community 51 - "Community 51"
Cohesion: 0.14
Nodes (5): AdminProjectsController, toAdminDto(), ProjectsService, AdminProject, AdminProjectListItem

### Community 52 - "Community 52"
Cohesion: 0.12
Nodes (26): useAdminMediaMutations(), listAdminMedia(), removeAdminMedia(), updateAdminMedia(), useAdminProject(), usePublishAdminProject(), useUnpublishAdminProject(), item (+18 more)

### Community 53 - "Community 53"
Cohesion: 0.10
Nodes (23): AdminRootLayout(), dynamic, metadata, viewport, generateStaticParams, LocaleLayout(), metadata, APP_TIME_ZONE (+15 more)

### Community 54 - "Community 54"
Cohesion: 0.11
Nodes (23): AdminLoginPage(), dynamic, ADMIN_LOGIN_AUTO_REDIRECT_KEY, clientHasAdminSession(), hasAdminLoginAutoRedirected(), markAdminLoginAutoRedirected(), { refreshOnce }, safeAdminNext() (+15 more)

### Community 55 - "Community 55"
Cohesion: 0.11
Nodes (15): NotSeededException, AdminSiteController, SiteSettingsRow, siteSettingsSelect, parseHeroStats(), toAdminDto(), toPublicHeroStats(), toPublicSiteSettings() (+7 more)

### Community 56 - "Community 56"
Cohesion: 0.10
Nodes (21): CaseStudyMeta(), PrevNext(), RelatedProjects(), listRelatedProjects(), formatPeriod(), projectNeighbors(), ProjectsDetail(), creativeWorkJsonLd() (+13 more)

### Community 57 - "Community 57"
Cohesion: 0.07
Nodes (35): depends_on, environment, image, ports, command, condition, environment, healthcheck (+27 more)

### Community 58 - "Community 58"
Cohesion: 0.08
Nodes (34): devDependencies, @commitlint/cli@^21.2.4, @commitlint/config-conventional@^21.2.4, eslint-config-prettier@^10.1.8, @eslint/js@^10.0.1, eslint-plugin-react@^7.37.5, eslint-plugin-simple-import-sort@^14.0.0, husky@^9.1.7 (+26 more)

### Community 59 - "Community 59"
Cohesion: 0.12
Nodes (21): AboutAvatar, MOCK_AVATAR_SRC, AboutIntroBlock(), ContactFormBlock(), PageHeaderBlock(), ChannelCards(), ChannelCardsView(), address (+13 more)

### Community 60 - "Community 60"
Cohesion: 0.11
Nodes (28): useAdminPage(), useAdminPages(), page, reorder, useBlockMutations(), useDiscardPage(), useInvalidatePage(), usePageVersion() (+20 more)

### Community 61 - "Community 61"
Cohesion: 0.09
Nodes (19): Entry, Locale, OUTPUT, ROUTES, messageList(), row(), Capture, Locale (+11 more)

### Community 62 - "Community 62"
Cohesion: 0.13
Nodes (22): CoverPlaceholder(), Amber, Blue, meta, Story, Violet, DomainCard(), FeatureCard() (+14 more)

### Community 63 - "Community 63"
Cohesion: 0.12
Nodes (23): lintFieldNames(), missingViFieldNames(), POST_LOCALE_FIELDS, PROJECT_LOCALE_FIELDS, splitFactLines(), asText(), EMPTY_COUNTS, localePairs() (+15 more)

### Community 64 - "Community 64"
Cohesion: 0.12
Nodes (22): generateMetadata, Page(), revalidate, generateMetadata, Page(), revalidate, AboutIndex(), BlocksPage() (+14 more)

### Community 65 - "Community 65"
Cohesion: 0.13
Nodes (5): AdminContactTopicsController, ContactTopicsService, toAdminDto(), AdminContactTopic, ContactTopicCreateInput

### Community 66 - "Community 66"
Cohesion: 0.13
Nodes (5): AdminPrinciplesController, toAdminDto(), PrinciplesService, AdminPrinciple, PrincipleCreateInput

### Community 67 - "Community 67"
Cohesion: 0.13
Nodes (5): AdminProfileStatsController, toAdminDto(), ProfileStatsService, AdminProfileStat, ProfileStatCreateInput

### Community 68 - "Community 68"
Cohesion: 0.22
Nodes (14): getProjectOrNull(), buildAlternates(), buildPostMetadata(), buildProjectMetadata(), fallbackMetadata(), postMetadata(), projectMetadata(), siteMetadata() (+6 more)

### Community 69 - "Community 69"
Cohesion: 0.09
Nodes (19): skillChipFixtures, ContentProgress(), Default, meta, Story, MigrationDiagram(), SKILL_SLOTS, FallbackChain (+11 more)

### Community 70 - "Community 70"
Cohesion: 0.09
Nodes (6): AdminMediaController, MediaService, AdminMedia, AdminMediaListPage, AdminMediaListParams, UpdateMediaInput

### Community 71 - "Community 71"
Cohesion: 0.12
Nodes (9): AdminUsersController, toAdminUser(), UsersModule, AdminUser, AdminUserListPage, AdminUserListParams, CreateUserInput, SetPasswordInput (+1 more)

### Community 72 - "Community 72"
Cohesion: 0.09
Nodes (20): BlockRenderer(), renderEntry(), context, labels, UnknownBlockNotice(), BlockRenderers, InvalidPreviewBlock, Band() (+12 more)

### Community 73 - "Community 73"
Cohesion: 0.10
Nodes (21): labels, renderMarkdown(), labels, MarkdownLabels, extractToc(), MdastNode, nodeText(), markdownKitchenSink (+13 more)

### Community 74 - "Community 74"
Cohesion: 0.14
Nodes (4): AdminSocialLinksController, toAdminDto(), SocialLinksService, AdminSocialLink

### Community 75 - "Community 75"
Cohesion: 0.16
Nodes (4): AdminDomainsController, DomainsService, toAdminDto(), AdminDomain

### Community 76 - "Community 76"
Cohesion: 0.15
Nodes (4): AdminNavigationController, toAdminDto(), NavigationService, AdminNavItem

### Community 77 - "Community 77"
Cohesion: 0.10
Nodes (9): DetectedMedia, MediaModule, CloudinaryMediaStorage, createMediaStorage(), MEDIA_STORAGE, MediaStorage, MemoryMediaStorage, StoredUpload (+1 more)

### Community 78 - "Community 78"
Cohesion: 0.13
Nodes (17): SiteLayout(), ProjectsBrowserBlock(), DraftBanner(), PageViewBeacon(), PreviewBridge(), refresh, PublicToaster(), SiteShell() (+9 more)

### Community 79 - "Community 79"
Cohesion: 0.16
Nodes (18): CardEmpty(), DashboardCard(), DELTA_ICON, DraftsCard(), DraftsCardView(), UnreadCard(), UnreadCardView(), ViewsCard() (+10 more)

### Community 80 - "Community 80"
Cohesion: 0.27
Nodes (16): AddBlockDialog(), BLOCK_EDITOR_META, TagPicker(), TechFilterMenu(), BlockType, IconPicker(), SlashMenu, Command() (+8 more)

### Community 81 - "Community 81"
Cohesion: 0.11
Nodes (23): ABOUT_ORDER, AI_AGENTS_BLOCK_KEY, applyOwnerCopy(), EXPERIENCE, patchRow(), PROFILE, PROJECTS, proseBlock() (+15 more)

### Community 82 - "Community 82"
Cohesion: 0.12
Nodes (19): adminPostListItemSchema, adminPostListPageSchema, adminPostListParamsSchema, adminPostListTagSchema, adminPostSchema, postCreateSchema, postListParamsSchema, postUpdateSchema (+11 more)

### Community 83 - "Community 83"
Cohesion: 0.13
Nodes (20): imageLoader(), nearestVariantWidth(), WIDTHS, adminMediaListPageSchema, adminMediaListParamsSchema, adminMediaSchema, adminProjectImageInputSchema, adminProjectImageSchema (+12 more)

### Community 84 - "Community 84"
Cohesion: 0.13
Nodes (17): MarkdownSection, splitMarkdownSections(), CaseStudySections(), caseStudyToc(), decisionId(), SectionSpec, splitDecisions(), splitLimitsAndScope() (+9 more)

### Community 85 - "Community 85"
Cohesion: 0.14
Nodes (19): DomainFilter(), Labels, ProjectsBrowser(), ProjectsBrowserIsland(), ProjectsBrowserProps, ProjectsBrowserView(), parseView(), ProjectsView() (+11 more)

### Community 86 - "Community 86"
Cohesion: 0.07
Nodes (27): scripts, build, check:all, check:content, check:deps, check:placeholders, db:down, db:logs (+19 more)

### Community 87 - "Community 87"
Cohesion: 0.12
Nodes (14): ICON_KEYS, iconKeySchema, profileStatFixtures, principleCreateSchema, principleUpdateSchema, publicPrincipleSchema, PrincipleUpdateInput, PublicPrinciple (+6 more)

### Community 88 - "Community 88"
Cohesion: 0.13
Nodes (19): SkillDepth, skillDepthSchema, adminSkillCategorySchema, adminSkillSchema, publicSkillCategorySchema, publicSkillChipSchema, publicSkillSchema, publicSkillsGroupedSchema (+11 more)

### Community 89 - "Community 89"
Cohesion: 0.12
Nodes (19): useAdminPost(), useCreateAdminPost(), usePublishAdminPost(), useSaveAdminPost(), useUnpublishAdminPost(), createAdminPost(), getAdminPost(), publishAdminPost() (+11 more)

### Community 90 - "Community 90"
Cohesion: 0.14
Nodes (17): buildUnmappedNote(), LocalizedPair, LocalizedProp, mapExperience(), mapProfile(), mapProjects(), mapReleaseStatus(), optionalInt() (+9 more)

### Community 91 - "Community 91"
Cohesion: 0.12
Nodes (17): dataDir, esbuild, outDir, require, root, collectHits(), findMarkers(), formatHits() (+9 more)

### Community 92 - "Community 92"
Cohesion: 0.20
Nodes (4): AdminPagesController, AdminPage, AdminPageVersion, AdminPageVersionListItem

### Community 93 - "Community 93"
Cohesion: 0.08
Nodes (17): MediaLibraryItem, Empty, Grid, items, meta, Story, clientHeightDesc, clientWidthDesc (+9 more)

### Community 94 - "Community 94"
Cohesion: 0.14
Nodes (21): dataFile(), loadPortfolioData(), buildVerifiedOwnerData(), cleanTextFields(), HERO_STATS, loadVerifiedOwnerData(), PUBLIC_REPO_PROJECT, readPrivateSource() (+13 more)

### Community 95 - "Community 95"
Cohesion: 0.09
Nodes (14): blocks(), readPage(), versions, mime, root, server, ALL, DESK (+6 more)

### Community 96 - "Community 96"
Cohesion: 0.10
Nodes (21): typescript@^5.9.3, typescript@^5.9.3, typescript@^5.9.3, typescript, dependencies, zod@^4.1.12, devDependencies, tsup@^8.5.0 (+13 more)

### Community 97 - "Community 97"
Cohesion: 0.15
Nodes (15): roleSchema, changePasswordSchema, loginSchema, meSchema, LoginInput, listParamsSchema(), Paginated, paginatedSchema() (+7 more)

### Community 98 - "Community 98"
Cohesion: 0.14
Nodes (14): localeQuerySchema, localeSchema, Entity, ListParams, adminContactTopicSchema, contactTopicCreateSchema, contactTopicUpdateSchema, publicContactTopicSchema (+6 more)

### Community 99 - "Community 99"
Cohesion: 0.15
Nodes (13): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+5 more)

### Community 100 - "Community 100"
Cohesion: 0.13
Nodes (17): secret, localDatabaseUrl(), testAnalyticsSalt(), testJwtAccess(), testJwtRefresh(), testRevalidateSecret(), ProfileStat, revalidateSite() (+9 more)

### Community 101 - "Community 101"
Cohesion: 0.17
Nodes (19): shiki@^4.5.0, previewMarkdown(), SHIKI_THEME_NAME, shikiCssTheme, ALLOWED_LANGS, classNameOf(), filenameOf(), getHighlighter() (+11 more)

### Community 102 - "Community 102"
Cohesion: 0.13
Nodes (3): AdminPreviewController, PublicPostDetail, PublicProjectDetail

### Community 103 - "Community 103"
Cohesion: 0.15
Nodes (17): AdminInboxRouteLayout(), isListedStatus(), useAdminMessages(), useInboxMutations(), getAdminMessage(), listAdminMessages(), queryString(), updateAdminMessage() (+9 more)

### Community 104 - "Community 104"
Cohesion: 0.16
Nodes (14): AdminHomePage(), firstSearchParam(), serverRenderTime(), ActivityCard(), ActivityCardView(), item, AdminDashboardIndex(), DashboardCell() (+6 more)

### Community 105 - "Community 105"
Cohesion: 0.13
Nodes (14): Cta, HeroBlock(), HeroSkeleton(), HeroStatItem, selectHeroStats(), block, getSite, renderHero() (+6 more)

### Community 106 - "Community 106"
Cohesion: 0.10
Nodes (22): environment, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ANALYTICS_SALT_SECRET, API_HOST, API_PORT, API_URL (+14 more)

### Community 107 - "Community 107"
Cohesion: 0.13
Nodes (9): IS_PUBLIC_KEY, ROLES_KEY, JwtAuthGuard, RolesGuard, context(), MockBlock, MockPage, TestAuthGuard (+1 more)

### Community 108 - "Community 108"
Cohesion: 0.14
Nodes (13): applySortableReorder(), SortableItem, SortableList(), onDragEnd(), SortableListLabels, SortableRow(), Demo(), KeyboardInstructions (+5 more)

### Community 109 - "Community 109"
Cohesion: 0.20
Nodes (16): flattenIssues(), fromFormData(), postContact(), requestOrigin(), submitContact(), submitContactForm(), flattenIssues(), postContact() (+8 more)

### Community 110 - "Community 110"
Cohesion: 0.15
Nodes (5): AdminEventsController, EventsModule, ContactCreatedEvent, EventsService, rxjs

### Community 111 - "Community 111"
Cohesion: 0.13
Nodes (14): labels, labels, confidentialProjectFixture, overflowProjectFixture, projectFixture, projectFixtures, skills, PublicProjectListItem (+6 more)

### Community 112 - "Community 112"
Cohesion: 0.13
Nodes (13): adminRoutes, editorRoutes, inlineListRoutes, publicScreens, copy, expectNoSeriousAxeIssues(), Capture, sizes (+5 more)

### Community 113 - "Community 113"
Cohesion: 0.22
Nodes (15): ContentHealthCard(), ContentHealthCardView(), issueDetail(), issueKey(), issueTitle(), Card(), CardContent(), CardDescription() (+7 more)

### Community 114 - "Community 114"
Cohesion: 0.11
Nodes (18): if, runs-on, steps, BASE, HEAD, jobs, context, name (+10 more)

### Community 115 - "Community 115"
Cohesion: 0.18
Nodes (11): publicSitemapEntrySchema, publicSitemapSchema, publicSiteSchema, PublicSitemapEntry, SocialKind, socialKindSchema, publicSocialLinkSchema, socialLinkCreateSchema (+3 more)

### Community 116 - "Community 116"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 117 - "Community 117"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 118 - "Community 118"
Cohesion: 0.16
Nodes (5): AdminDashboardController, DashboardModule, DashboardService, toStatusCounts(), AdminStats

### Community 119 - "Community 119"
Cohesion: 0.17
Nodes (11): PublicRoute, publicRouteSchema, NavLocation, navLocationSchema, adminNavItemSchema, navHrefSchema, navItemCreateSchema, navItemUpdateSchema (+3 more)

### Community 120 - "Community 120"
Cohesion: 0.17
Nodes (6): GET(), customPageKey(), CustomSitePage(), safeDraftPath(), isReservedPublicPageSlug(), PublicSitemap

### Community 121 - "Community 121"
Cohesion: 0.18
Nodes (12): Availability, availabilitySchema, adminSiteSettingsSchema, HERO_STAT_LIMITS, heroStatSchema, heroStatsSchema, publicHeroStatSchema, publicSiteSettingsSchema (+4 more)

### Community 122 - "Community 122"
Cohesion: 0.22
Nodes (10): toPublicSkill(), listMarqueeSkills(), listSkillsGrouped(), guardExperience(), guardSkillGroups(), guardSkills(), experience, skill (+2 more)

### Community 123 - "Community 123"
Cohesion: 0.20
Nodes (11): generateStaticParams, GET(), revalidate, robots(), revalidate, sitemap(), isBuildPhase(), getSitemap() (+3 more)

### Community 124 - "Community 124"
Cohesion: 0.24
Nodes (12): item, page, params, useRemoveAdminExperience(), useToggleExperienceVisible(), removeAdminExperience(), updateAdminExperience(), QuerySnapshot (+4 more)

### Community 125 - "Community 125"
Cohesion: 0.15
Nodes (13): category, skillFixtures, skillsGroupedFixture, PublicSkillChip, groupSkillsByCategory(), SkillCategoryGroup, SkillGroup(), Default (+5 more)

### Community 126 - "Community 126"
Cohesion: 0.12
Nodes (16): scripts, build, content:migration, db:migrate, db:reset, db:seed, db:studio, dev (+8 more)

### Community 127 - "Community 127"
Cohesion: 0.20
Nodes (3): AdminProfileController, ProfileService, AdminProfile

### Community 128 - "Community 128"
Cohesion: 0.17
Nodes (12): formatDate(), PostPrevNext(), postFixture, postFixtures, viPostFixture, PublicPostListItem, PostCard(), Featured (+4 more)

### Community 129 - "Community 129"
Cohesion: 0.12
Nodes (15): needs, runs-on, timeout-minutes, concurrency, cancel-in-progress, group, jobs, build (+7 more)

### Community 130 - "Community 130"
Cohesion: 0.25
Nodes (16): steps, steps, steps, steps, E2E_SHARD, GH_TOKEN, steps, env (+8 more)

### Community 131 - "Community 131"
Cohesion: 0.13
Nodes (6): args, steps, CONTENT_ROOTS, DENYLIST, failures, files

### Community 132 - "Community 132"
Cohesion: 0.21
Nodes (10): AdminProfilePage(), useAdminProfile(), useSaveAdminProfile(), getAdminProfile(), updateAdminProfile(), AdminSiteProfile(), admin, getProfile (+2 more)

### Community 133 - "Community 133"
Cohesion: 0.18
Nodes (10): CtaBandBlock(), Atmosphere(), Disabled, Hero, meta, Story, CtaBand(), Default (+2 more)

### Community 134 - "Community 134"
Cohesion: 0.19
Nodes (7): StatBand(), StatItem(), Compact, Default, meta, Story, parseStatValue()

### Community 135 - "Community 135"
Cohesion: 0.13
Nodes (14): paths, key, sync, value, services, buildFilter, dockerContext, dockerfilePath (+6 more)

### Community 136 - "Community 136"
Cohesion: 0.14
Nodes (13): ANALYTICS_SALT_SECRET, API_PORT, API_URL, assert_target(), DATABASE_URL, DATABASE_URL_TEST, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (+5 more)

### Community 137 - "Community 137"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+6 more)

### Community 138 - "Community 138"
Cohesion: 0.26
Nodes (7): ProfileStatRow, profileStatSelect, toPublicProfileStat(), resolveStatValue(), yearsSince(), StatSource, PublicProfileStat

### Community 139 - "Community 139"
Cohesion: 0.22
Nodes (10): useAdminHealth(), fetchAdminHealth(), fetchAdminStats(), admin, fetchHealth, fetchStats, renderDashboard(), StatsRange (+2 more)

### Community 140 - "Community 140"
Cohesion: 0.14
Nodes (14): if, runs-on, services, timeout-minutes, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, MYSQL_USER (+6 more)

### Community 141 - "Community 141"
Cohesion: 0.15
Nodes (9): ColorBook, ColorModes, colorsPath, cssPath, here, hexToRgba(), parseColor(), Rgba (+1 more)

### Community 142 - "Community 142"
Cohesion: 0.26
Nodes (10): revalidatePublicContent(), changesPublicContent(), isDraft(), PUBLIC_CACHE_SYNC_DEBOUNCE_MS, revalidatePublicContent, setup(), usePublicCacheSync(), PublicCacheMode (+2 more)

### Community 143 - "Community 143"
Cohesion: 0.19
Nodes (8): startHeroShader(), draw(), resume(), startShader(), colors(), frame(), resume(), rgb()

### Community 145 - "Community 145"
Cohesion: 0.29
Nodes (9): adminRoutes, applySecurityHeaders(), config, handleI18n, proxy(), requestWithNonce(), buildContentSecurityPolicy(), SECURITY_HEADER_NAMES (+1 more)

### Community 146 - "Community 146"
Cohesion: 0.17
Nodes (11): description, name, runs, steps, using, run, shell, uses (+3 more)

### Community 147 - "Community 147"
Cohesion: 0.17
Nodes (12): web-e2e-shard, shard, actions, contents, fail-fast, matrix, if, name (+4 more)

### Community 148 - "Community 148"
Cohesion: 0.17
Nodes (11): runs-on, steps, timeout-minutes, jobs, ci-ok, name, on, pull_request (+3 more)

### Community 149 - "Community 149"
Cohesion: 0.26
Nodes (10): hasText(), isLocalizedPair(), mapLocalized(), ParseBlockFail, ParseBlockOk, ParseBlockResult, ParseBlockRow, resolveBlockLocale() (+2 more)

### Community 150 - "Community 150"
Cohesion: 0.18
Nodes (4): adminDir, captures, publicDir, source

### Community 151 - "Community 151"
Cohesion: 0.29
Nodes (8): isLocalized(), JsonSchema, kindFor(), SchemaFieldKind, schemaToFields(), unwrap(), walk(), WIDGET_KIND

### Community 152 - "Community 152"
Cohesion: 0.38
Nodes (8): useAdminUsers(), useUserMutations(), createAdminUser(), listAdminUsers(), queryString(), setAdminUserPassword(), signOutAdminUser(), updateAdminUser()

### Community 153 - "Community 153"
Cohesion: 0.25
Nodes (7): OutcomeStats(), PublicProjectMetric, DiffStat(), Diff, meta, Story, Value

### Community 155 - "Community 155"
Cohesion: 0.22
Nodes (11): environment, environment, BACKUP_DIR, MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_ROOT_PASSWORD (+3 more)

### Community 156 - "Community 156"
Cohesion: 0.36
Nodes (4): ContactTopicRow, contactTopicSelect, toPublicContactTopic(), PublicContactTopic

### Community 157 - "Community 157"
Cohesion: 0.20
Nodes (10): depends_on, image, read_only, restart, tmpfs, volumes, depends_on, condition (+2 more)

### Community 158 - "Community 158"
Cohesion: 0.36
Nodes (10): env, env, API_HOST, API_PORT, API_URL, NEXT_PUBLIC_SITE_URL, NODE_ENV, WEB_INTERNAL_URL (+2 more)

### Community 159 - "Community 159"
Cohesion: 0.20
Nodes (10): with, compression-level, filters, key, merge-multiple, name, path, pattern (+2 more)

### Community 160 - "Community 160"
Cohesion: 0.24
Nodes (7): domainFixture, domainFixtures, emptyDomainFixture, Default, meta, Set, Story

### Community 161 - "Community 161"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, start, test, test:e2e, test:visual:update (+1 more)

### Community 162 - "Community 162"
Cohesion: 0.22
Nodes (8): name, services, volumes, backups, caddy-config, caddy-data, db-data, uploads

### Community 163 - "Community 163"
Cohesion: 0.33
Nodes (6): principleFixtures, PrincipleList(), principleNumber(), Default, meta, Story

### Community 164 - "Community 164"
Cohesion: 0.33
Nodes (6): processStepFixtures, ProcessFlow(), stepNumber(), Default, meta, Story

### Community 165 - "Community 165"
Cohesion: 0.29
Nodes (8): build, API_URL, NEXT_PUBLIC_BUILD_SHA, NEXT_PUBLIC_SITE_URL, args, context, dockerfile, build

### Community 166 - "Community 166"
Cohesion: 0.25
Nodes (8): condition, api, web, depends_on, image, read_only, restart, tmpfs

### Community 167 - "Community 167"
Cohesion: 0.25
Nodes (8): depends_on, image, ports, read_only, restart, tmpfs, volumes, caddy

### Community 168 - "Community 168"
Cohesion: 0.25
Nodes (8): on, pull_request, push, workflow_dispatch, paths-ignore, types, branches, paths-ignore

### Community 169 - "Community 169"
Cohesion: 0.25
Nodes (7): Conflict, labels, meta, Offline, Saved, Saving, Story

### Community 170 - "Community 170"
Cohesion: 0.25
Nodes (6): CORE, CORE_BG, Default, meta, PAIR_ROWS, Story

### Community 171 - "Community 171"
Cohesion: 0.25
Nodes (6): Default, meta, RADII, SHADOWS, SPACES, Story

### Community 172 - "Community 172"
Cohesion: 0.48
Nodes (5): assert_target(), DATABASE_URL, query(), seed_snapshot(), migration-gate.sh script

### Community 174 - "Community 174"
Cohesion: 0.38
Nodes (3): dialog(), openAdminMore(), openMenu()

### Community 175 - "Community 175"
Cohesion: 0.38
Nodes (6): ADMIN_ROUTES, dynamicParts(), expectScreen(), PUBLIC_ROUTES, settle(), VIEWPORTS

### Community 176 - "Community 176"
Cohesion: 0.29
Nodes (4): monorepoRoot, nextConfig, withNextIntl, root

### Community 177 - "Community 177"
Cohesion: 0.48
Nodes (7): healthcheck, healthcheck, interval, retries, start_period, test, timeout

### Community 178 - "Community 178"
Cohesion: 0.29
Nodes (7): entrypoint, image, read_only, restart, tmpfs, volumes, backup

### Community 179 - "Community 179"
Cohesion: 0.29
Nodes (7): command, image, read_only, restart, tmpfs, volumes, db

### Community 180 - "Community 180"
Cohesion: 0.29
Nodes (7): if, name, outputs, runs-on, timeout-minutes, build-e2e, playwright

### Community 181 - "Community 181"
Cohesion: 0.29
Nodes (6): main, git, deploymentEnabled, ignoreCommand, regions, $schema

### Community 182 - "Community 182"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 183 - "Community 183"
Cohesion: 0.40
Nodes (5): copy, CraftPage(), generateMetadata(), revalidate, studyLabel()

### Community 184 - "Community 184"
Cohesion: 0.33
Nodes (3): Capture, Locale, OUTPUT

### Community 185 - "Community 185"
Cohesion: 0.60
Nodes (4): useAdminSite(), useSaveAdminSite(), getAdminSite(), updateAdminSite()

### Community 186 - "Community 186"
Cohesion: 0.73
Nodes (5): asRecord(), asString(), firstH1(), readIntro(), readTitle()

### Community 187 - "Community 187"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, test, typecheck

### Community 189 - "Community 189"
Cohesion: 0.33
Nodes (6): exports, ./components/*, ./hooks/*, ./lib/utils, ./styles/globals.css, ./utils/*

### Community 190 - "Community 190"
Cohesion: 0.33
Nodes (6): scripts, build-storybook, lint, storybook, test, typecheck

### Community 191 - "Community 191"
Cohesion: 0.33
Nodes (4): Default, EASINGS, meta, Story

### Community 192 - "Community 192"
Cohesion: 0.33
Nodes (4): Default, meta, ROWS, Story

### Community 193 - "Community 193"
Cohesion: 0.50
Nodes (3): chromeStyles(), PROPERTIES, styleOf()

### Community 196 - "Community 196"
Cohesion: 0.50
Nodes (3): expectProgressOnClick(), measureProgressDelay(), ProgressWindow

### Community 197 - "Community 197"
Cohesion: 0.40
Nodes (5): outputs, runs-on, timeout-minutes, changes, ui

### Community 198 - "Community 198"
Cohesion: 0.40
Nodes (5): web-e2e, if, needs, runs-on, timeout-minutes

### Community 200 - "Community 200"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 210 - "Community 210"
Cohesion: 0.67
Nodes (3): eslint@^9.39.1, eslint@^10.13.0, eslint

## Knowledge Gaps
- **13 isolated node(s):** `ANALYTICS_SALT_SECRET`, `API_PORT`, `API_URL`, `DATABASE_URL`, `DATABASE_URL_TEST` (+8 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1657 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@storybook/react` connect `Community 25` to `Community 128`, `Community 1`, `Community 2`, `Community 0`, `Community 133`, `Community 134`, `Community 10`, `Community 14`, `Community 19`, `Community 153`, `Community 27`, `Community 160`, `Community 163`, `Community 164`, `Community 169`, `Community 170`, `Community 171`, `Community 47`, `Community 56`, `Community 59`, `Community 62`, `Community 191`, `Community 64`, `Community 192`, `Community 69`, `Community 72`, `Community 73`, `Community 84`, `Community 93`, `Community 108`, `Community 111`, `Community 113`, `Community 125`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `ANALYTICS_SALT_SECRET`, `API_PORT`, `API_URL` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04252352736144998 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `Community 96` to `Community 9`, `Community 58`, `Community 10`, `Community 33`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.057360178970917226 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Community 26` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 12`, `Community 15`, `Community 16`, `Community 145`, `Community 28`, `Community 29`, `Community 31`, `Community 33`, `Community 39`, `Community 42`, `Community 176`, `Community 53`, `Community 54`, `Community 183`, `Community 56`, `Community 59`, `Community 64`, `Community 68`, `Community 205`, `Community 206`, `Community 207`, `Community 208`, `Community 79`, `Community 78`, `Community 85`, `Community 99`, `Community 103`, `Community 109`, `Community 113`, `Community 120`, `Community 123`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.03570170287727539 - nodes in this community are weakly interconnected._