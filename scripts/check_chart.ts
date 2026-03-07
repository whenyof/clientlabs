import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'iyanrimada@gmail.com' } })
    if (!user) {
        console.error("User not found")
        return
    }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days

    await prisma.session.create({
        data: {
            id: crypto.randomUUID(),
            sessionToken: token,
            userId: user.id,
            expires: expires
        }
    })

    console.log("Session created. Launching browser...")
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    page.on('console', msg => {
        if (msg.text().includes('RevenueChart') || msg.type() === 'error' || msg.type() === ('warning' as any)) {
            console.log('BROWSER LOG:', msg.type(), msg.text())
        }
    })

    await page.setCookie({
        name: 'next-auth.session-token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        expires: expires.getTime() / 1000
    })

    console.log("Navigating to dashboard...")
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' })

    // Wait extra time for React/Recharts to mount
    await new Promise(r => setTimeout(r, 2000))

    const diagnosis = await page.evaluate(() => {
        const rechartsWrapper = document.querySelector('.recharts-responsive-container') as HTMLElement

        if (!rechartsWrapper) {
            return {
                error: "No recharts-responsive-container found on the page",
                h2s: Array.from(document.querySelectorAll('h2')).map(h => h.textContent)
            }
        }

        const wFullH460 = rechartsWrapper.parentElement as HTMLElement
        const containerDiv = wFullH460.parentElement as HTMLElement

        const responsiveContainer = wFullH460.querySelector('.recharts-responsive-container') as HTMLElement
        const svg = wFullH460.querySelector('svg')

        let pathDetails: (string | null)[] = []
        if (svg) {
            pathDetails = Array.from(svg.querySelectorAll('path')).map(p => p.getAttribute('d'))
        }

        return {
            containerInfo: {
                className: containerDiv.className,
                offsetHeight: containerDiv.offsetHeight,
                offsetWidth: containerDiv.offsetWidth
            },
            wFullH460Info: {
                className: wFullH460.className,
                offsetHeight: wFullH460.offsetHeight,
                offsetWidth: wFullH460.offsetWidth,
                computedHeight: window.getComputedStyle(wFullH460).height,
                responsiveContainerExists: !!responsiveContainer,
                responsiveContainerHeight: responsiveContainer ? responsiveContainer.offsetHeight : null
            },
            svgExists: !!svg,
            svgWidth: svg?.getAttribute('width'),
            svgHeight: svg?.getAttribute('height'),
            svgPathsCount: pathDetails.length,
            svgPaths: pathDetails.filter(d => !!d).slice(0, 5) // just taking a few to see if they have values
        }
    })

    console.log("DIAGNOSIS:", JSON.stringify(diagnosis, null, 2))

    await browser.close()

    // Cleanup
    await prisma.session.delete({ where: { sessionToken: token } })
}

main().catch(console.error).finally(() => prisma.$disconnect())
