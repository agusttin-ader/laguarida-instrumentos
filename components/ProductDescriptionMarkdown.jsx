import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

const mdBase =
  'text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[1.125rem] min-[1920px]:text-[1.2rem] min-[2560px]:text-[1.28rem] leading-[1.48] sm:leading-[1.5] text-[var(--dark-text-secondary)]'

const headingBase =
  'font-semibold text-[var(--dark-text-primary)] tracking-tight scroll-mt-24'

export default function ProductDescriptionMarkdown({ children }) {
  const source = String(children ?? '').trim()
  if (!source) return null

  return (
    <div className={`product-detail-md-root ${mdBase}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children, ...rest }) => (
            <h3
              className={`${headingBase} mt-3 first:mt-0 mb-1 text-lg sm:text-xl md:text-[1.2rem]`}
              {...rest}
            >
              {children}
            </h3>
          ),
          h2: ({ children, ...rest }) => (
            <h4
              className={`${headingBase} mt-2.5 first:mt-0 mb-1 text-base sm:text-lg md:text-[1.1rem]`}
              {...rest}
            >
              {children}
            </h4>
          ),
          h3: ({ children, ...rest }) => (
            <h5
              className={`${headingBase} mt-2 first:mt-0 mb-0.5 text-[15px] sm:text-base`}
              {...rest}
            >
              {children}
            </h5>
          ),
          h4: ({ children, ...rest }) => (
            <h5 className={`${headingBase} mt-2 first:mt-0 mb-0.5 text-[15px]`} {...rest}>
              {children}
            </h5>
          ),
          h5: ({ children, ...rest }) => (
            <h6 className={`${headingBase} mt-2 first:mt-0 mb-0.5 text-[14px] sm:text-[15px]`} {...rest}>
              {children}
            </h6>
          ),
          h6: ({ children, ...rest }) => (
            <h6 className={`${headingBase} mt-1.5 first:mt-0 mb-0.5 text-[14px]`} {...rest}>
              {children}
            </h6>
          ),
          p: ({ children, ...rest }) => (
            <p className="m-0 mb-2 last:mb-0" {...rest}>
              {children}
            </p>
          ),
          ul: ({ children, ...rest }) => (
            <ul className="m-0 mb-2 last:mb-0 list-disc pl-4 sm:pl-4 space-y-0.5 marker:text-[var(--vintage-gold)]" {...rest}>
              {children}
            </ul>
          ),
          ol: ({ children, ...rest }) => (
            <ol className="m-0 mb-2 last:mb-0 list-decimal pl-4 sm:pl-4 space-y-0.5 marker:font-medium marker:text-[var(--dark-text-primary)]" {...rest}>
              {children}
            </ol>
          ),
          li: ({ children, ...rest }) => (
            <li className="pl-0.5 [&>p]:mb-1 [&>p:last-child]:mb-0" {...rest}>
              {children}
            </li>
          ),
          strong: ({ children, ...rest }) => (
            <strong className="font-semibold text-[var(--dark-text-primary)]" {...rest}>
              {children}
            </strong>
          ),
          em: ({ children, ...rest }) => (
            <em className="italic text-[var(--dark-text-secondary)]" {...rest}>
              {children}
            </em>
          ),
          a: ({ href, children, ...rest }) => {
            const external = href && /^https?:\/\//i.test(href)
            return (
              <a
                href={href}
                className="text-[var(--vintage-gold)] underline underline-offset-[3px] decoration-[var(--vintage-gold)]/55 hover:opacity-90 transition-opacity"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...rest}
              >
                {children}
              </a>
            )
          },
          blockquote: ({ children, ...rest }) => (
            <blockquote
              className="m-0 mb-2 border-l-[3px] border-[var(--vintage-gold)]/45 pl-2.5 py-0 text-[var(--dark-muted)] italic text-[0.96em]"
              {...rest}
            >
              {children}
            </blockquote>
          ),
          hr: (props) => <hr className="my-2.5 border-0 border-t border-[var(--dark-border)]" {...props} />,
          table: ({ children, ...rest }) => (
            <div className="overflow-x-auto mb-2 -mx-1">
              <table className="w-full min-w-[280px] text-[0.92em] border-collapse border border-[var(--dark-border)] rounded-lg overflow-hidden" {...rest}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...rest }) => (
            <thead className="bg-black/25" {...rest}>
              {children}
            </thead>
          ),
          th: ({ children, ...rest }) => (
            <th
              className="border border-[var(--dark-border)] px-2 py-1.5 text-left text-[0.95em] font-semibold text-[var(--dark-text-primary)]"
              {...rest}
            >
              {children}
            </th>
          ),
          td: ({ children, ...rest }) => (
            <td className="border border-[var(--dark-border)] px-2 py-1.5 align-top text-[0.95em]" {...rest}>
              {children}
            </td>
          ),
          code: ({ className, children, ...rest }) => {
            const inline = !className
            if (inline) {
              return (
                <code
                  className="rounded-md bg-black/35 px-1.5 py-0.5 text-[0.88em] text-[var(--dark-text-primary)] font-medium"
                  {...rest}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            )
          },
          pre: ({ children, ...rest }) => (
            <pre
              className="overflow-x-auto rounded-lg bg-black/40 border border-[var(--dark-border)] p-2 sm:p-2.5 my-2 text-[0.88em] leading-snug text-[var(--dark-text-secondary)]"
              {...rest}
            >
              {children}
            </pre>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
